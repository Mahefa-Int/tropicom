import { defineConfig } from "drizzle-kit";
import { readFileSync, existsSync } from "node:fs";

// drizzle-kit ne lit pas les fichiers .env tout seul : on charge .env.local (poste de travail) ou
// .env.production.local (serveur PlanetHoster), sauf si DATABASE_URL est déjà définie
for (const file of [".env.local", ".env.production.local"]) {
  if (process.env.DATABASE_URL || !existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

export default defineConfig({
  dialect: "mysql",
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
