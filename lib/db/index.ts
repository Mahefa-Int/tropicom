import "server-only";
import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

/**
 * Connexion à la base (pool réutilisé, y compris entre les rechargements à chaud en développement).
 * DATABASE_URL : mysql://utilisateur:motdepasse@hôte:3306/base (fichier .env.local en local,
 * variables d'environnement de l'application Node.js chez PlanetHoster en production).
 */
const g = globalThis as unknown as { __tcPool?: mysql.Pool };

function pool() {
  if (!g.__tcPool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL manquant (voir .env.local)");
    g.__tcPool = mysql.createPool({ uri: url, connectionLimit: 5, dateStrings: false, timezone: "Z", charset: "utf8mb4" });
    // tout en UTC : les dates par défaut de la base (CURRENT_TIMESTAMP) et celles écrites par le code concordent
    g.__tcPool.on("connection", (c) => {
      c.query("SET time_zone = '+00:00'");
    });
  }
  return g.__tcPool;
}

type DB = MySql2Database<typeof schema>;
let instance: DB | undefined;
const getDb = (): DB => (instance ??= drizzle(pool(), { schema, mode: "default" }));

/**
 * Connexion ouverte au premier usage seulement (pas au chargement du fichier) : la compilation (« next build »,
 * Vercel…) charge toutes les routes sans base de données disponible ; elle ne doit pas échouer pour autant.
 */
export const db = new Proxy({} as DB, {
  get(_, prop) {
    const d = getDb();
    const v = Reflect.get(d, prop, d);
    return typeof v === "function" ? v.bind(d) : v;
  },
});
export { schema };
