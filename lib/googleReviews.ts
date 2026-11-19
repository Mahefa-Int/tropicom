import "server-only";

/**
 * Avis Google de la fiche Tropi'Com, via l'API Google Places (New) — « Place Details ».
 * Variables d'environnement : GOOGLE_PLACES_API_KEY (clé API, restreinte à l'API Places) et GOOGLE_PLACE_ID
 * (identifiant de la fiche Google Business). Réponse mise en cache 24 h (une requête par jour au plus).
 * Limite de Google : l'API renvoie au plus 5 avis (les « plus pertinents »), on garde ceux de 4 étoiles et plus.
 */
export type GoogleReview = {
  author: string;
  authorUrl?: string;
  avatar?: string;
  rating: number;
  text: string;
  date: string; // « il y a 2 semaines » (fourni par Google, en français)
  publishTime?: string;
};

export type GoogleReviews = { reviews: GoogleReview[]; rating: number; total: number; url?: string };

type ApiReview = {
  rating?: number;
  text?: { text?: string };
  originalText?: { text?: string };
  relativePublishTimeDescription?: string;
  publishTime?: string;
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
};

export async function getGoogleReviews(minRating = 4): Promise<GoogleReviews | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const place = process.env.GOOGLE_PLACE_ID;
  if (!key || !place) return null;
  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(place)}?languageCode=fr`, {
      headers: {
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "rating,userRatingCount,reviews,googleMapsUri",
      },
      next: { revalidate: 86400 },
    });
    if (!res.ok) {
      console.error("Avis Google : réponse", res.status, await res.text().catch(() => ""));
      return null;
    }
    const data = (await res.json()) as { rating?: number; userRatingCount?: number; googleMapsUri?: string; reviews?: ApiReview[] };
    const reviews = (data.reviews ?? [])
      .filter((r) => (r.rating ?? 0) >= minRating && (r.originalText?.text || r.text?.text))
      .map((r) => ({
        author: r.authorAttribution?.displayName ?? "Client Google",
        authorUrl: r.authorAttribution?.uri,
        avatar: r.authorAttribution?.photoUri,
        rating: r.rating ?? 5,
        // texte d'origine (sans traduction automatique) quand il existe
        text: (r.originalText?.text || r.text?.text || "").trim(),
        date: r.relativePublishTimeDescription ?? "",
        publishTime: r.publishTime,
      }));
    return { reviews, rating: data.rating ?? 0, total: data.userRatingCount ?? 0, url: data.googleMapsUri };
  } catch (e) {
    console.error("Avis Google indisponibles :", e);
    return null;
  }
}
