import { asc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/admin/dal";
import { PageHead } from "@/components/admin/ui";
import CaseForm from "@/components/admin/CaseForm";

export const metadata = { title: "Nouvelle réalisation" };

export default async function NewCase() {
  await requireUser();
  const others = await db
    .select({ id: schema.caseStudies.id, client: schema.caseStudies.client, title: schema.caseStudies.title, status: schema.caseStudies.status })
    .from(schema.caseStudies)
    .orderBy(asc(schema.caseStudies.sortOrder));
  return (
    <>
      <PageHead title="Nouvelle réalisation" crumb={{ href: "/admin/realisations", label: "Réalisations" }} />
      <CaseForm others={others} />
    </>
  );
}
