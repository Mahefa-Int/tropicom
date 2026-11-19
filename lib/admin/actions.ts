"use server";

/**
 * Actions serveur du back-office. Chacune vérifie la session (requireUser) avant d'agir :
 * elles sont appelables comme des API publiques, la vérification ne doit jamais être seulement dans l'interface.
 */
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { and, desc, eq, ne, sql } from "drizzle-orm";
import { readFile, rename, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { requireUser } from "./dal";
import { createSession, deleteSession, deleteUserSessions } from "./session";
import { hashPassword, passwordProblem, verifyPassword } from "./password";
import { slugify, type FormState } from "./util";
import { DetailsSchema, emptyDetails, fullTitle } from "@/lib/cases";
import { toOptimizedWebp, uploadDir } from "./images";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const optional = (v: string) => (v === "" ? null : v);

/* ------------------------------------------------------------------ connexion */

// limite simple : 5 essais ratés par adresse e-mail + IP sur 15 minutes (mémoire du processus)
const attempts = new Map<string, { n: number; until: number }>();

export async function login(_: FormState, form: FormData): Promise<FormState> {
  const email = str(form, "email").toLowerCase();
  const password = String(form.get("password") ?? "");
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const key = `${email}|${ip}`;
  const a = attempts.get(key);
  if (a && a.n >= 5 && a.until > Date.now()) {
    return { error: "Trop d'essais. Réessayez dans quelques minutes.", fields: { email } };
  }
  const user = email ? (await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1))[0] : undefined;
  const ok = !!user && user.active && (await verifyPassword(password, user.passwordHash));
  if (!ok) {
    attempts.set(key, { n: (a && a.until > Date.now() ? a.n : 0) + 1, until: Date.now() + 15 * 60 * 1000 });
    return { error: "E-mail ou mot de passe incorrect.", fields: { email } };
  }
  attempts.delete(key);
  await db.update(schema.users).set({ lastLoginAt: new Date() }).where(eq(schema.users.id, user.id));
  await createSession(user.id, form.get("remember") === "on");
  redirect("/admin");
}

export async function logout() {
  await deleteSession();
  redirect("/admin/connexion");
}

/* ------------------------------------------------------------------ articles */

const PostSchema = z.object({
  title: z.string().min(2, "Titre requis."),
  slug: z.string(),
  categoryId: z.string(),
  excerpt: z.string(),
  content: z.string(),
  coverUrl: z.string(),
  status: z.enum(["draft", "published"]),
  seoTitle: z.string(),
  seoDescription: z.string().max(300, "300 caractères maximum."),
});

export async function savePost(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const id = Number(form.get("id")) || null;
  const parsed = PostSchema.safeParse({
    title: str(form, "title"),
    slug: str(form, "slug"),
    categoryId: str(form, "categoryId"),
    excerpt: str(form, "excerpt"),
    content: String(form.get("content") ?? ""),
    coverUrl: str(form, "coverUrl"),
    status: str(form, "status") || "draft",
    seoTitle: str(form, "seoTitle"),
    seoDescription: str(form, "seoDescription"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const slug = slugify(d.slug || d.title);
  if (!slug) return { error: "Adresse (slug) invalide." };
  const clash = await db
    .select({ id: schema.posts.id })
    .from(schema.posts)
    .where(id ? and(eq(schema.posts.slug, slug), ne(schema.posts.id, id)) : eq(schema.posts.slug, slug))
    .limit(1);
  if (clash.length) return { error: "Un autre article utilise déjà cette adresse." };

  const values = {
    title: d.title,
    slug,
    categoryId: Number(d.categoryId) || null,
    excerpt: optional(d.excerpt),
    content: d.content,
    coverUrl: optional(d.coverUrl),
    status: d.status,
    seoTitle: optional(d.seoTitle),
    seoDescription: optional(d.seoDescription),
    updatedAt: new Date(),
  };
  let postId = id;
  if (id) {
    const current = (await db.select({ publishedAt: schema.posts.publishedAt }).from(schema.posts).where(eq(schema.posts.id, id)))[0];
    if (!current) return { error: "Article introuvable." };
    await db
      .update(schema.posts)
      .set({ ...values, publishedAt: d.status === "published" ? (current.publishedAt ?? new Date()) : current.publishedAt })
      .where(eq(schema.posts.id, id));
  } else {
    const res = await db.insert(schema.posts).values({ ...values, authorId: user.id, publishedAt: d.status === "published" ? new Date() : null });
    postId = res[0].insertId;
  }
  revalidatePath("/admin/articles");
  if (!id) redirect(`/admin/articles/${postId}?cree=1`);
  return { ok: "Article enregistré." };
}

export async function deletePost(id: number) {
  await requireUser();
  await db.delete(schema.posts).where(eq(schema.posts.id, id));
  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}

/* ------------------------------------------------------------------ catégories d'articles */

async function categoryClash(slug: string, exceptId?: number) {
  const rows = await db
    .select({ id: schema.categories.id })
    .from(schema.categories)
    .where(exceptId ? and(eq(schema.categories.slug, slug), ne(schema.categories.id, exceptId)) : eq(schema.categories.slug, slug))
    .limit(1);
  return rows.length > 0;
}

/** ajout depuis la page Catégories (formulaire) */
export async function createCategory(_: FormState, form: FormData): Promise<FormState> {
  await requireUser();
  const name = str(form, "name").slice(0, 80);
  if (name.length < 2) return { error: "Nom requis (2 caractères minimum).", fields: { name } };
  const slug = slugify(name).slice(0, 80);
  if (await categoryClash(slug)) return { error: "Cette catégorie existe déjà.", fields: { name } };
  await db.insert(schema.categories).values({ name, slug });
  revalidatePath("/admin/categories");
  return { ok: `Catégorie « ${name} » ajoutée.` };
}

/** ajout rapide depuis le formulaire d'un article : renvoie la catégorie créée (ou existante) */
export async function quickCreateCategory(name: string): Promise<{ id: number; name: string } | { error: string }> {
  await requireUser();
  const clean = name.trim().slice(0, 80);
  if (clean.length < 2) return { error: "Nom trop court." };
  const slug = slugify(clean).slice(0, 80);
  const existing = (await db.select().from(schema.categories).where(eq(schema.categories.slug, slug)).limit(1))[0];
  if (existing) return { id: existing.id, name: existing.name };
  const res = await db.insert(schema.categories).values({ name: clean, slug });
  revalidatePath("/admin/categories");
  return { id: res[0].insertId, name: clean };
}

export async function renameCategory(id: number, name: string): Promise<{ error?: string }> {
  await requireUser();
  const clean = name.trim().slice(0, 80);
  if (clean.length < 2) return { error: "Nom trop court." };
  const slug = slugify(clean).slice(0, 80);
  if (await categoryClash(slug, id)) return { error: "Une autre catégorie porte déjà ce nom." };
  await db.update(schema.categories).set({ name: clean, slug }).where(eq(schema.categories.id, id));
  revalidatePath("/admin/categories");
  revalidatePath("/admin/articles");
  return {};
}

/** suppression : les articles de cette catégorie restent, sans catégorie */
export async function deleteCategory(id: number) {
  await requireUser();
  await db.update(schema.posts).set({ categoryId: null }).where(eq(schema.posts.categoryId, id));
  await db.delete(schema.categories).where(eq(schema.categories.id, id));
  revalidatePath("/admin/categories");
  revalidatePath("/admin/articles");
}

/** catégories suggérées (pôles de l'agence + actualités), ajoutées d'un clic quand la liste est vide */
export async function createSuggestedCategories() {
  await requireUser();
  const names = ["Marque", "Contenu", "Acquisition", "Academy", "Labs", "Actualités"];
  for (const [i, name] of names.entries()) {
    const slug = slugify(name);
    if (!(await categoryClash(slug))) await db.insert(schema.categories).values({ name, slug, sortOrder: i });
  }
  revalidatePath("/admin/categories");
}

/* ------------------------------------------------------------------ réalisations */

export async function saveCaseStudy(_: FormState, form: FormData): Promise<FormState> {
  await requireUser();
  const id = Number(form.get("id")) || null;
  let raw: unknown;
  try {
    raw = JSON.parse(String(form.get("details") ?? "{}"));
  } catch {
    return { error: "Contenu illisible, rechargez la page." };
  }
  const parsed = DetailsSchema.safeParse({ ...emptyDetails(), ...(raw as object) });
  if (!parsed.success) return { error: "Contenu invalide." };
  const details = parsed.data;
  if (id && details.nextId === id) details.nextId = null;
  const client = str(form, "client");
  if (client.length < 2) return { error: "Nom du client requis." };
  if (details.titleLead.trim().length < 2) return { error: "Titre requis (1re ligne)." };
  const title = fullTitle(details).slice(0, 200);
  const slug = slugify(str(form, "slug") || client);
  if (!slug) return { error: "Adresse (slug) invalide." };
  const clash = await db
    .select({ id: schema.caseStudies.id })
    .from(schema.caseStudies)
    .where(id ? and(eq(schema.caseStudies.slug, slug), ne(schema.caseStudies.id, id)) : eq(schema.caseStudies.slug, slug))
    .limit(1);
  if (clash.length) return { error: "Une autre réalisation utilise déjà cette adresse." };
  const status = str(form, "status") === "published" ? "published" : "draft";
  const values = {
    title,
    slug,
    client,
    sector: optional(str(form, "sector")),
    location: optional(str(form, "location")),
    coverUrl: optional(str(form, "coverUrl")),
    details: JSON.stringify(details),
    status: status as "draft" | "published",
    sortOrder: Number(form.get("sortOrder")) || 0,
    updatedAt: new Date(),
  };
  let caseId = id;
  let oldSlug: string | undefined;
  if (id) {
    oldSlug = (await db.select({ slug: schema.caseStudies.slug }).from(schema.caseStudies).where(eq(schema.caseStudies.id, id)))[0]?.slug;
    await db.update(schema.caseStudies).set(values).where(eq(schema.caseStudies.id, id));
  } else caseId = (await db.insert(schema.caseStudies).values(values))[0].insertId;
  revalidatePath("/admin/realisations");
  // la carte « Projet suivant » des autres réalisations peut afficher celle-ci : on rafraîchit toutes les pages
  revalidatePath("/realisations/[slug]", "page");
  if (oldSlug && oldSlug !== slug) revalidatePath(`/realisations/${oldSlug}`);
  if (!id) redirect(`/admin/realisations/${caseId}?cree=1`);
  return { ok: "Réalisation enregistrée." };
}

export async function deleteCaseStudy(id: number) {
  await requireUser();
  await db.delete(schema.caseStudies).where(eq(schema.caseStudies.id, id));
  revalidatePath("/admin/realisations");
  revalidatePath("/realisations/[slug]", "page");
  redirect("/admin/realisations");
}

/* ------------------------------------------------------------------ messages */

export async function setMessageRead(id: number, read: boolean) {
  await requireUser();
  await db.update(schema.messages).set({ isRead: read }).where(eq(schema.messages.id, id));
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

export async function deleteMessage(id: number) {
  await requireUser();
  await db.delete(schema.messages).where(eq(schema.messages.id, id));
  revalidatePath("/admin/messages");
  redirect("/admin/messages");
}

/* ------------------------------------------------------------------ médias */

export type MediaPick = { id: number; url: string; name: string; alt: string; width: number | null; height: number | null };

/** liste pour « Choisir dans la Médiathèque » (formulaires, éditeur d'articles) */
export async function listMedia(): Promise<MediaPick[]> {
  await requireUser();
  const rows = await db
    .select({ id: schema.media.id, url: schema.media.url, name: schema.media.filename, alt: schema.media.alt, width: schema.media.width, height: schema.media.height })
    .from(schema.media)
    .orderBy(desc(schema.media.createdAt));
  return rows.map((r) => ({ ...r, name: r.name ?? r.url, alt: r.alt ?? "" }));
}

export async function updateMediaAlt(id: number, alt: string) {
  await requireUser();
  await db.update(schema.media).set({ alt: alt.slice(0, 255) }).where(eq(schema.media.id, id));
  revalidatePath("/admin/medias");
}

export async function updateMediaDescription(id: number, description: string) {
  await requireUser();
  const clean = description.trim().slice(0, 2000);
  await db.update(schema.media).set({ description: clean || null }).where(eq(schema.media.id, id));
  revalidatePath("/admin/medias");
}

export type OptimizeResult = { error: string } | { before: number; after: number; already?: boolean; name: string };

/** nom de fichier libre dans la médiathèque : base.ext, sinon base-2.ext, base-3.ext… */
async function freeName(base: string, ext: string, exceptId: number) {
  for (let i = 1; i < 500; i++) {
    const name = `${base}${i > 1 ? "-" + i : ""}.${ext}`;
    const taken = await db
      .select({ id: schema.media.id })
      .from(schema.media)
      .where(and(eq(schema.media.filename, name), ne(schema.media.id, exceptId)))
      .limit(1);
    if (!taken.length && !(await stat(path.join(uploadDir(), name)).catch(() => null))) return name;
  }
  return `${base}-${Date.now()}.${ext}`;
}

/** remplace une adresse d'image dans tous les contenus qui l'utilisent (articles, réalisations) */
async function replaceMediaUrl(from: string, to: string) {
  await db.update(schema.posts).set({ content: sql`REPLACE(${schema.posts.content}, ${from}, ${to})` }).where(sql`${schema.posts.content} LIKE ${"%" + from + "%"}`);
  await db.update(schema.posts).set({ coverUrl: to }).where(eq(schema.posts.coverUrl, from));
  await db.update(schema.caseStudies).set({ coverUrl: to }).where(eq(schema.caseStudies.coverUrl, from));
  await db
    .update(schema.caseStudies)
    .set({ details: sql`REPLACE(${schema.caseStudies.details}, ${from}, ${to})` })
    .where(sql`${schema.caseStudies.details} LIKE ${"%" + from + "%"}`);
  revalidatePath("/", "layout");
}

/**
 * « Optimiser » : conversion en webp, côté le plus long ramené à 2560 px, compression sans perte visible (lib/admin/images.ts).
 * Renommage : si le texte alternatif est rempli, le fichier prend son nom suivi de « tropicom »
 * (« Façade de l'hôtel » → facade-de-l-hotel-tropicom.webp) ; sinon il garde son nom.
 * L'adresse change : elle est remplacée partout où l'image est utilisée (articles, réalisations).
 * Si la compression ne gagne pas 5 %, le fichier d'origine est gardé (seulement renommé).
 */
export async function optimizeMedia(id: number, alt?: string): Promise<OptimizeResult> {
  await requireUser();
  const m = (await db.select().from(schema.media).where(eq(schema.media.id, id)))[0];
  if (!m) return { error: "Image introuvable." };
  if (m.mime === "image/gif") return { error: "Les GIF animés ne sont pas optimisés (l'animation serait perdue)." };
  // texte alternatif envoyé par la fenêtre (même s'il vient d'être tapé), sinon celui de la base
  const altText = (alt ?? m.alt ?? "").trim().slice(0, 255);
  const dir = uploadDir();
  const oldName = path.basename(m.filename);
  let input: Buffer;
  try {
    input = await readFile(path.join(dir, oldName));
  } catch {
    return { error: "Fichier introuvable sur le serveur." };
  }
  let out: Awaited<ReturnType<typeof toOptimizedWebp>>;
  try {
    out = await toOptimizedWebp(input);
  } catch {
    return { error: "Image illisible." };
  }
  const before = m.originalSize ?? input.length;
  const keep = out.data.length >= input.length * 0.95; // gain trop faible : on garde le fichier actuel
  const data = keep ? input : out.data;
  const ext = keep ? path.extname(oldName).slice(1) || "webp" : "webp";
  const oldBase = oldName.replace(/\.[^.]+$/, "");
  const altBase = altText ? `${slugify(altText).slice(0, 80).replace(/-+$/, "")}-tropicom` : "";
  const base = altBase && altBase !== "-tropicom" ? altBase : oldBase;
  const newName = base === oldBase && ext === path.extname(oldName).slice(1) ? oldName : await freeName(base, ext, id);

  if (newName !== oldName || !keep) {
    const tmp = path.join(dir, newName + ".tmp");
    await writeFile(tmp, data);
    await rename(tmp, path.join(dir, newName));
  }
  const url = `/media/${newName}`;
  await db
    .update(schema.media)
    .set({
      filename: newName,
      url,
      alt: altText || null,
      ...(keep ? {} : { mime: "image/webp", size: out.data.length, width: out.width, height: out.height }),
      originalSize: before,
      optimizedAt: new Date(),
    })
    .where(eq(schema.media.id, id));
  if (newName !== oldName) {
    await unlink(path.join(dir, oldName)).catch(() => {});
    await replaceMediaUrl(m.url, url);
  }
  revalidatePath("/admin/medias");
  return { before, after: data.length, already: keep, name: newName };
}

export async function deleteMedia(id: number) {
  await requireUser();
  const m = (await db.select().from(schema.media).where(eq(schema.media.id, id)))[0];
  if (!m) return;
  await unlink(path.join(uploadDir(), path.basename(m.filename))).catch(() => {});
  await db.delete(schema.media).where(eq(schema.media.id, id));
  revalidatePath("/admin/medias");
}

/* ------------------------------------------------------------------ mon compte */

export async function updateAccount(_: FormState, form: FormData): Promise<FormState> {
  const me = await requireUser();
  const name = str(form, "name");
  const email = str(form, "email").toLowerCase();
  if (name.length < 2) return { error: "Nom requis." };
  if (!z.email().safeParse(email).success) return { error: "E-mail invalide." };
  const clash = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(and(eq(schema.users.email, email), ne(schema.users.id, me.id)))
    .limit(1);
  if (clash.length) return { error: "Cet e-mail est déjà utilisé." };
  await db.update(schema.users).set({ name, email }).where(eq(schema.users.id, me.id));
  revalidatePath("/admin", "layout");
  return { ok: "Profil mis à jour." };
}

export async function changePassword(_: FormState, form: FormData): Promise<FormState> {
  const me = await requireUser();
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  const row = (await db.select().from(schema.users).where(eq(schema.users.id, me.id)))[0];
  if (!row || !(await verifyPassword(current, row.passwordHash))) return { error: "Mot de passe actuel incorrect." };
  const pb = passwordProblem(next);
  if (pb) return { error: pb };
  if (next !== confirm) return { error: "Les deux nouveaux mots de passe ne sont pas identiques." };
  await db.update(schema.users).set({ passwordHash: await hashPassword(next) }).where(eq(schema.users.id, me.id));
  // toutes les autres sessions sont fermées, on reste connecté ici
  await deleteUserSessions(me.id);
  await createSession(me.id, true);
  return { ok: "Mot de passe changé." };
}
