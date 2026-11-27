import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/admin/dal";
import { PageHead } from "@/components/admin/ui";
import { ReviewForm } from "@/components/admin/ReviewForms";

export const metadata = { title: "Modifier un avis" };

export default async function EditReviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const review = (await db.select().from(schema.reviews).where(eq(schema.reviews.id, Number(id))).limit(1))[0];
  if (!review) notFound();
  return (
    <>
      <PageHead title={review.author} crumb={{ href: "/admin/avis", label: "Avis" }} />
      <div style={{ maxWidth: 820 }}>
        <ReviewForm review={review} />
      </div>
    </>
  );
}
