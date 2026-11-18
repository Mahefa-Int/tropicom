import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/admin/dal";
import { deleteCaseStudy } from "@/lib/admin/actions";
import { PageHead } from "@/components/admin/ui";
import CaseForm from "@/components/admin/CaseForm";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { Icons } from "@/components/admin/icons";

export const metadata = { title: "Modifier la réalisation" };

export default async function EditCase({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ cree?: string }> }) {
  await requireUser();
  const { id } = await params;
  const { cree } = await searchParams;
  const item = (await db.select().from(schema.caseStudies).where(eq(schema.caseStudies.id, Number(id))).limit(1))[0];
  if (!item) notFound();
  return (
    <>
      <PageHead title={item.title} crumb={{ href: "/admin/realisations", label: "Réalisations" }}>
        <ConfirmButton action={deleteCaseStudy.bind(null, item.id)} confirm="Supprimer définitivement cette réalisation ?">
          {Icons.trash}
          Supprimer
        </ConfirmButton>
      </PageHead>
      <CaseForm item={item} created={!!cree} />
    </>
  );
}
