import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { EXPERTISES, expertiseHref } from "@/lib/expertises";

/** sitemap.xml : pages publiques, pages d'expertise et réalisations publiées (relu toutes les heures) */
const SITE_URL = process.env.SITE_URL || "https://www.tropicomagency.com";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" = "monthly") => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });
  const cases = await db
    .select({ slug: schema.caseStudies.slug, updatedAt: schema.caseStudies.updatedAt })
    .from(schema.caseStudies)
    .where(eq(schema.caseStudies.status, "published"))
    .catch(() => []);
  return [
    page("/", 1, "weekly"),
    page("/expertises", 0.9),
    ...EXPERTISES.map((e) => page(expertiseHref(e.slug), 0.8)),
    page("/realisations", 0.9, "weekly"),
    ...cases.map((c) => ({ url: `${SITE_URL}/realisations/${c.slug}`, lastModified: c.updatedAt ?? now, changeFrequency: "monthly" as const, priority: 0.7 })),
    page("/agence/equipe", 0.6),
    page("/agence/notre-histoire", 0.6),
    page("/agence/carrieres", 0.5),
    page("/ressources", 0.6),
    page("/contact", 0.8),
  ];
}
