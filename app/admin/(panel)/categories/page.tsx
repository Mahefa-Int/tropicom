import { asc, count, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/admin/dal";
import { Empty, PageHead } from "@/components/admin/ui";
import { CategoryCreateForm, CategoryRow, SuggestedCategoriesButton } from "@/components/admin/Categories";

export const metadata = { title: "Catégories" };

export default async function CategoriesPage() {
  await requireUser();
  const rows = await db
    .select({ id: schema.categories.id, name: schema.categories.name, slug: schema.categories.slug, n: count(schema.posts.id) })
    .from(schema.categories)
    .leftJoin(schema.posts, eq(schema.posts.categoryId, schema.categories.id))
    .groupBy(schema.categories.id)
    .orderBy(asc(schema.categories.sortOrder), asc(schema.categories.name));

  return (
    <>
      <PageHead title="Catégories" text="Classez les articles du blog. Supprimer une catégorie ne supprime pas ses articles." crumb={{ href: "/admin/articles", label: "Articles" }} />
      <div className="adm-grid adm-grid--2">
        <section className="adm-card">
          {rows.length ? (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Adresse</th>
                  <th>Articles</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <CategoryRow key={c.id} id={c.id} name={c.name} slug={c.slug} count={c.n} />
                ))}
              </tbody>
            </table>
          ) : (
            <Empty title="Aucune catégorie" text="Ajoutez vos catégories, ou partez des pôles de l'agence.">
              <SuggestedCategoriesButton />
            </Empty>
          )}
        </section>
        <CategoryCreateForm />
      </div>
    </>
  );
}
