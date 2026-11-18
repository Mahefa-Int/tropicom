"use server";

/**
 * Actions serveur du back-office. Chacune vérifie la session (requireUser) avant d'agir :
 * elles sont appelables comme des API publiques, la vérification ne doit jamais être seulement dans l'interface.
 */
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { and, eq, ne } from "drizzle-orm";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { requireUser } from "./dal";
import { createSession, deleteSession, deleteUserSessions } from "./session";
import { hashPassword, passwordProblem, verifyPassword } from "./password";
import { slugify, type FormState } from "./util";

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
  await createSession(user.id);
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
  category: z.string(),
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
    category: str(form, "category"),
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
    category: optional(d.category),
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

/* ------------------------------------------------------------------ réalisations */

export async function saveCaseStudy(_: FormState, form: FormData): Promise<FormState> {
  await requireUser();
  const id = Number(form.get("id")) || null;
  const title = str(form, "title");
  if (title.length < 2) return { error: "Titre requis." };
  const slug = slugify(str(form, "slug") || title);
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
    client: optional(str(form, "client")),
    sector: optional(str(form, "sector")),
    location: optional(str(form, "location")),
    coverUrl: optional(str(form, "coverUrl")),
    situation: optional(str(form, "situation")),
    response: optional(str(form, "response")),
    results: optional(str(form, "results")),
    status: status as "draft" | "published",
    sortOrder: Number(form.get("sortOrder")) || 0,
    updatedAt: new Date(),
  };
  let caseId = id;
  if (id) await db.update(schema.caseStudies).set(values).where(eq(schema.caseStudies.id, id));
  else caseId = (await db.insert(schema.caseStudies).values(values))[0].insertId;
  revalidatePath("/admin/realisations");
  if (!id) redirect(`/admin/realisations/${caseId}?cree=1`);
  return { ok: "Réalisation enregistrée." };
}

export async function deleteCaseStudy(id: number) {
  await requireUser();
  await db.delete(schema.caseStudies).where(eq(schema.caseStudies.id, id));
  revalidatePath("/admin/realisations");
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

export async function updateMediaAlt(id: number, alt: string) {
  await requireUser();
  await db.update(schema.media).set({ alt: alt.slice(0, 255) }).where(eq(schema.media.id, id));
  revalidatePath("/admin/medias");
}

export async function deleteMedia(id: number) {
  await requireUser();
  const m = (await db.select().from(schema.media).where(eq(schema.media.id, id)))[0];
  if (!m) return;
  const dir = path.resolve(process.env.UPLOAD_DIR || "./uploads");
  await unlink(path.join(dir, path.basename(m.filename))).catch(() => {});
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
  await createSession(me.id);
  return { ok: "Mot de passe changé." };
}
