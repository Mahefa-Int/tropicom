import { asc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/admin/dal";
import { PageHead } from "@/components/admin/ui";
import PostForm from "@/components/admin/PostForm";

export const metadata = { title: "Nouvel article" };

export default async function NewPost() {
  await requireUser();
  const categories = await db
    .select({ id: schema.categories.id, name: schema.categories.name })
    .from(schema.categories)
    .orderBy(asc(schema.categories.sortOrder), asc(schema.categories.name));
  return (
    <>
      <PageHead title="Nouvel article" crumb={{ href: "/admin/articles", label: "Articles" }} />
      <PostForm categories={categories} />
    </>
  );
}
