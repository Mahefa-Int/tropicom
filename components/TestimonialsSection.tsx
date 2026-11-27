import { DEFAULT_PLACE_ID, getReviewSettings, googleLinks, listReviews, relativeDate } from "@/lib/reviews";
import Testimonials, { FALLBACK_REVIEWS, type Review } from "./Testimonials";

/**
 * « Nos clients en parlent » : avis gérés dans admin → Avis (copiés depuis la fiche Google), avec la note globale,
 * le nombre d'avis et les liens « Voir tous nos avis » / « Laisser un avis ».
 * Sans avis publié, on garde les avis de la maquette (avec la note et les liens Google) ;
 * base indisponible : avis de la maquette, liens Google vers la fiche par défaut.
 */
export default async function TestimonialsSection() {
  const data = await Promise.all([listReviews(true), getReviewSettings()]).catch((e) => {
    console.error("Avis : base indisponible", e);
    return null;
  });
  if (!data) return <Testimonials reviews={FALLBACK_REVIEWS} summary={{ rating: 0, total: 0, ...googleLinks(DEFAULT_PLACE_ID) }} />;
  const [rows, s] = data;
  const summary = { rating: s.rating, total: s.total, ...googleLinks(s.placeId) };
  if (rows.length === 0) return <Testimonials reviews={FALLBACK_REVIEWS} summary={summary} />;
  const month = 30 * 24 * 60 * 60 * 1000;
  const reviews: Review[] = rows.map((r) => ({
    author: r.author,
    avatar: r.avatarUrl ?? undefined,
    rating: r.rating,
    text: r.text,
    date: relativeDate(r.reviewDate),
    isNew: r.reviewDate ? Date.now() - new Date(r.reviewDate).getTime() < month : false,
  }));
  return <Testimonials reviews={reviews} summary={summary} />;
}
