import { defineConfig } from "drizzle-kit";
import { readFileSync, existsSync } from "node:fs";

// drizzle-kit ne lit pas .env.local tout seul : on le charge ici (en production, la variable est déjà définie)
if (!process.env.DATABASE_URL && existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
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
