/**
 * Crée (ou réinitialise) un compte administrateur.
 *   npm run db:admin -- email@exemple.com "Nom affiché"
 * Un mot de passe aléatoire est généré et affiché UNE SEULE FOIS : le changer ensuite dans l'admin (« Mon compte »).
 * Lit DATABASE_URL dans l'environnement, sinon dans .env.local.
 */
import { readFileSync, existsSync } from "node:fs";
import { scrypt, randomBytes } from "node:crypto";
import mysql from "mysql2/promise";

if (!process.env.DATABASE_URL && existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const [email, name = "Administrateur"] = process.argv.slice(2);
if (!email || !email.includes("@")) {
  console.error('Usage : npm run db:admin -- email@exemple.com "Nom affiché"');
  process.exit(1);
}

// même format que lib/admin/password.ts
const N = 16384, R = 8, P = 1;
const salt = randomBytes(16);
const password = randomBytes(12).toString("base64url");
const key = await new Promise((res, rej) => scrypt(password, salt, 64, { N, r: R, p: P, maxmem: 64 * 1024 * 1024 }, (e, k) => (e ? rej(e) : res(k))));
const hash = `scrypt$${N}$${R}$${P}$${salt.toString("base64url")}$${key.toString("base64url")}`;

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute("SELECT id FROM users WHERE email = ?", [email.toLowerCase()]);
if (rows.length) {
  await conn.execute("UPDATE users SET password_hash = ?, role = 'admin', active = 1 WHERE id = ?", [hash, rows[0].id]);
  await conn.execute("DELETE FROM sessions WHERE user_id = ?", [rows[0].id]);
  console.log(`Compte existant réinitialisé (admin) : ${email}`);
} else {
  await conn.execute("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')", [name, email.toLowerCase(), hash]);
  console.log(`Compte administrateur créé : ${email}`);
}
await conn.end();
console.log(`Mot de passe provisoire : ${password}`);
console.log("→ Connexion sur /admin/connexion, puis changer le mot de passe dans « Mon compte ».");
