import { getGoogleReviews } from "@/lib/googleReviews";
import Testimonials, { FALLBACK_REVIEWS, type Review } from "./Testimonials";

/**
 * « Nos clients en parlent » : vrais avis Google (4 étoiles et plus), relus une fois par jour.
 * Sans avis Google disponibles (clé absente, erreur, aucun avis ≥ 4), on garde les avis de la maquette.
 */
export default async function TestimonialsSection() {
  const g = await getGoogleReviews(4);
  if (!g || g.reviews.length === 0) return <Testimonials reviews={FALLBACK_REVIEWS} />;
  const month = 30 * 24 * 60 * 60 * 1000;
  const reviews: Review[] = g.reviews.map((r) => ({
    author: r.author,
    authorUrl: r.authorUrl,
    avatar: r.avatar,
    rating: r.rating,
    text: r.text,
    date: r.date,
    isNew: r.publishTime ? Date.now() - new Date(r.publishTime).getTime() < month : false,
  }));
  return <Testimonials reviews={reviews} summary={{ rating: g.rating, total: g.total, url: g.url }} />;
}
