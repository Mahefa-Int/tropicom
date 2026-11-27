import type { MetadataRoute } from "next";

/** robots.txt : tout le site public est indexable, sauf l'admin, les API et les pages de test */
const SITE_URL = process.env.SITE_URL || "https://www.tropicomagency.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/essai", "/rendez-vous", "/maintenance"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
