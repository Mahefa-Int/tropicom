import "server-only";
import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Mots de passe : scrypt (inclus dans Node, aucune dépendance), sel aléatoire de 16 octets.
 * Format enregistré : scrypt$N$r$p$sel$empreinte (base64url) — le même que scripts/create-admin.mjs.
 */
const N = 16384, R = 8, P = 1, KEYLEN = 64;

function derive(password: string, salt: Buffer, n = N, r = R, p = P): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(password, salt, KEYLEN, { N: n, r, p, maxmem: 64 * 1024 * 1024 }, (err, key) => (err ? reject(err) : resolve(key))),
  );
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await derive(password, salt);
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64url")}$${key.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [algo, n, r, p, salt, hash] = stored.split("$");
  if (algo !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const key = await derive(password, Buffer.from(salt, "base64url"), +n, +r, +p);
  return key.length === expected.length && timingSafeEqual(key, expected);
}

/** règle commune : 10 caractères minimum, au moins une lettre et un chiffre */
export function passwordProblem(password: string) {
  if (password.length < 10) return "10 caractères minimum.";
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) return "Au moins une lettre et un chiffre.";
  return null;
}
