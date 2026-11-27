import "server-only";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/lib/db";

/**
 * Avis clients gérés dans l'admin (admin → Avis), copiés à la main depuis la fiche Google.
 * Gratuit, sans API : la note globale et le nombre d'avis se règlent dans la même page.
 * L'identifiant de la fiche Google (Place ID) est fixe : DEFAULT_PLACE_ID ci-dessous (affiché en lecture seule).
 */
export const REVIEW_KEYS = { rating: "reviews.rating", total: "reviews.total", placeId: "reviews.placeId" } as const;

/** identifiant de la fiche Google « Tropi'Com Agency Madagascar » (non modifiable dans l'admin) */
export const DEFAULT_PLACE_ID = "ChIJpQVOwWh_8CERCXp45b_qUeM";

export type ReviewSettings = { rating: number; total: number; placeId: string };

export async function getReviewSettings(): Promise<ReviewSettings> {
  const rows = await db
    .select()
    .from(schema.settings)
    .where(inArray(schema.settings.key, Object.values(REVIEW_KEYS)));
  const v = (k: string) => rows.find((r) => r.key === k)?.value ?? "";
  return {
    rating: Number(v(REVIEW_KEYS.rating).replace(",", ".")) || 0,
    total: Number(v(REVIEW_KEYS.total)) || 0,
    placeId: DEFAULT_PLACE_ID,
  };
}

/** liens Google de la fiche : voir les avis / en laisser un */
export const googleLinks = (placeId: string) => ({
  url: `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(placeId)}`,
  writeUrl: `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`,
});

export const listReviews = (onlyPublished: boolean) =>
  db
    .select()
    .from(schema.reviews)
    .where(onlyPublished ? eq(schema.reviews.status, "published") : undefined)
    .orderBy(asc(schema.reviews.sortOrder), desc(schema.reviews.reviewDate), desc(schema.reviews.id));

/** « il y a 2 mois » à partir de la date de l'avis */
export function relativeDate(day: string | null) {
  if (!day) return "";
  const diff = Date.now() - new Date(day + "T12:00:00Z").getTime();
  const days = Math.max(0, Math.round(diff / 86400000));
  const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });
  if (days < 7) return rtf.format(-days, "day");
  if (days < 30) return rtf.format(-Math.round(days / 7), "week");
  if (days < 365) return rtf.format(-Math.round(days / 30), "month");
  return rtf.format(-Math.round(days / 365), "year");
}
