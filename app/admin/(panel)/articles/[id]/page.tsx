import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/admin/dal";
import { deletePost } from "@/lib/admin/actions";
import { PageHead } from "@/components/admin/ui";
import PostForm from "@/components/admin/PostForm";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { Icons } from "@/components/admin/icons";

export const metadata = { title: "Modifier l'article" };

export default async function EditPost({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ cree?: string }> }) {
  await requireUser();
  const { id } = await params;
  const { cree } = await searchParams;
  const post = (await db.select().from(schema.posts).where(eq(schema.posts.id, Number(id))).limit(1))[0];
  if (!post) notFound();
  const categories = await db
    .select({ id: schema.categories.id, name: schema.categories.name })
    .from(schema.categories)
    .orderBy(asc(schema.categories.sortOrder), asc(schema.categories.name));
  return (
    <>
      <PageHead title={post.title} crumb={{ href: "/admin/articles", label: "Articles" }}>
        <ConfirmButton action={deletePost.bind(null, post.id)} confirm="Supprimer définitivement cet article ?" className="adm-btn adm-btn--danger" label="Supprimer">
          {Icons.trash}
        </ConfirmButton>
      </PageHead>
      <PostForm post={post} created={!!cree} categories={categories} />
    </>
  );
}
