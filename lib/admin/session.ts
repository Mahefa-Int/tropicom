import "server-only";
import { cookies, headers } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import { db, schema } from "@/lib/db";

/**
 * Sessions en base : le cookie « tc_admin » contient un jeton aléatoire (32 octets) ;
 * la table sessions n'en garde que l'empreinte SHA-256 (un vol de la base ne donne pas de jeton utilisable).
 * Durée : « se souvenir de moi » coché → 30 jours (cookie persistant) ;
 * sinon → cookie effacé à la fermeture du navigateur, et session de 12 h au plus côté serveur.
 */
export const SESSION_COOKIE = "tc_admin";
const REMEMBER_MS = 30 * 24 * 60 * 60 * 1000;
const SHORT_MS = 12 * 60 * 60 * 1000;

const digest = (token: string) => createHash("sha256").update(token).digest("hex");

async function setCookie(token: string, expires?: Date) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // sans date : cookie « de session », supprimé à la fermeture du navigateur
    ...(expires && { expires }),
  });
}

export async function createSession(userId: number, remember = false) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + (remember ? REMEMBER_MS : SHORT_MS));
  const ua = ((await headers()).get("user-agent") ?? "").slice(0, 255);
  await db.insert(schema.sessions).values({ id: digest(token), userId, expiresAt, userAgent: ua });
  // ménage : sessions expirées
  await db.delete(schema.sessions).where(lt(schema.sessions.expiresAt, new Date()));
  await setCookie(token, remember ? expiresAt : undefined);
}

/** utilisateur de la session courante (ou null) — vérifié en base à chaque appel */
export async function readSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await db
    .select({
      sessionId: schema.sessions.id,
      expiresAt: schema.sessions.expiresAt,
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      role: schema.users.role,
      active: schema.users.active,
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
    .where(and(eq(schema.sessions.id, digest(token)), gt(schema.sessions.expiresAt, new Date())))
    .limit(1);
  const row = rows[0];
  if (!row || !row.active) return null;
  return { id: row.id, name: row.name, email: row.email, role: row.role };
}

export async function deleteSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(schema.sessions).where(eq(schema.sessions.id, digest(token)));
  store.delete(SESSION_COOKIE);
}

/** déconnecte toutes les sessions d'un utilisateur (changement de mot de passe, compte désactivé) */
export async function deleteUserSessions(userId: number) {
  await db.delete(schema.sessions).where(eq(schema.sessions.userId, userId));
}
