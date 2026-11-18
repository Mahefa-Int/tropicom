import { desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/admin/dal";
import { PageHead } from "@/components/admin/ui";
import MediaLibrary from "@/components/admin/MediaLibrary";

export const metadata = { title: "Médiathèque" };

export default async function MediaPage() {
  await requireUser();
  const items = await db
    .select({
      id: schema.media.id,
      url: schema.media.url,
      originalName: schema.media.originalName,
      alt: schema.media.alt,
      width: schema.media.width,
      height: schema.media.height,
      size: schema.media.size,
    })
    .from(schema.media)
    .orderBy(desc(schema.media.createdAt));
  return (
    <>
      <PageHead title="Médiathèque" text="Toutes les images du site, converties en webp à l'envoi." />
      <MediaLibrary items={items} />
    </>
  );
}
