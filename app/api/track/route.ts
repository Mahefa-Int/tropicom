import { cookies } from "next/headers";
import { sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { PREVIEW_COOKIE, maintenanceOn, previewToken } from "@/lib/preview";

/**
 * Compteur de pages vues (admin → Statistiques → « Pages les plus visitées »).
 * Appelé par components/PageViewTracker.tsx à chaque page affichée. Sans cookie ni donnée personnelle :
 * on garde seulement le jour, l'adresse de la page et un total.
 * Non comptés : robots, équipe connectée à l'admin, visiteurs qui voient la page de maintenance.
 */
const BOT = /bot|crawl|spider|slurp|preview|lighthouse|headless|facebookexternalhit|whatsapp|curl|wget/i;

export async function POST(req: Request) {
  if (BOT.test(req.headers.get("user-agent") ?? "")) return new Response(null, { status: 204 });
  const jar = await cookies();
  if (jar.has("tc_admin")) return new Response(null, { status: 204 });
  if (maintenanceOn() && jar.get(PREVIEW_COOKIE)?.value !== (await previewToken())) return new Response(null, { status: 204 });

  const body = (await req.json().catch(() => ({}))) as { path?: unknown };
  let path = typeof body.path === "string" ? body.path : "";
  path = path.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  if (!path.startsWith("/") || path.length > 190 || /^\/(admin|api|_next|maintenance)(\/|$)/.test(path)) {
    return new Response(null, { status: 204 });
  }

  const day = new Date().toISOString().slice(0, 10); // jour en UTC
  await db
    .insert(schema.pageViews)
    .values({ day, path, views: 1 })
    .onDuplicateKeyUpdate({ set: { views: sql`${schema.pageViews.views} + 1` } })
    .catch((e) => console.error("Compteur de visites indisponible", e));
  return new Response(null, { status: 204 });
}
