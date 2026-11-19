import Link from "next/link";
import { asc, desc, eq, isNull, like, and, type SQL } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/admin/dal";
import { formatDate } from "@/lib/admin/util";
import { Empty, PageHead, StatusBadge } from "@/components/admin/ui";
import { Icons } from "@/components/admin/icons";

export const metadata = { title: "Articles" };

export default async function PostsPage({ searchParams }: { searchParams: Promise<{ q?: string; statut?: string; categorie?: string }> }) {
  await requireUser();
  const { q = "", statut = "", categorie = "" } = await searchParams;
  const where: SQL[] = [];
  if (q) where.push(like(schema.posts.title, `%${q}%`));
  if (statut === "draft" || statut === "published") where.push(eq(schema.posts.status, statut));
  if (categorie === "aucune") where.push(isNull(schema.posts.categoryId));
  else if (Number(categorie)) where.push(eq(schema.posts.categoryId, Number(categorie)));
  const [posts, categories] = await Promise.all([
    db
      .select({
        id: schema.posts.id,
        title: schema.posts.title,
        slug: schema.posts.slug,
        coverUrl: schema.posts.coverUrl,
        status: schema.posts.status,
        updatedAt: schema.posts.updatedAt,
        category: schema.categories.name,
      })
      .from(schema.posts)
      .leftJoin(schema.categories, eq(schema.categories.id, schema.posts.categoryId))
      .where(where.length ? and(...where) : undefined)
      .orderBy(desc(schema.posts.updatedAt)),
    db.select({ id: schema.categories.id, name: schema.categories.name }).from(schema.categories).orderBy(asc(schema.categories.sortOrder), asc(schema.categories.name)),
  ]);
  const filtered = !!(q || statut || categorie);

  return (
    <>
      <PageHead title="Articles" text="Le blog du site : actualités, conseils, études.">
        <Link href="/admin/categories" className="adm-btn">
          {Icons.tag}
          Catégories
        </Link>
        <Link href="/admin/articles/nouveau" className="adm-btn adm-btn--primary">
          {Icons.plus}
          Nouvel article
        </Link>
      </PageHead>
      <section className="adm-card">
        <form style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <input name="q" className="adm-input" placeholder="Rechercher un titre…" defaultValue={q} style={{ maxWidth: 340 }} />
          <select name="statut" className="adm-select" defaultValue={statut} style={{ maxWidth: 170 }}>
            <option value="">Tous les statuts</option>
            <option value="published">Publiés</option>
            <option value="draft">Brouillons</option>
          </select>
          <select name="categorie" className="adm-select" defaultValue={categorie} style={{ maxWidth: 200 }}>
            <option value="">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            <option value="aucune">Sans catégorie</option>
          </select>
          <button className="adm-btn">Filtrer</button>
        </form>
        {posts.length ? (
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: 70 }} />
                <th>Titre</th>
                <th>Catégorie</th>
                <th>Statut</th>
                <th>Modifié</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id}>
                  <td>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {p.coverUrl ? <img className="adm-thumb" src={p.coverUrl} alt="" /> : <span className="adm-thumb" style={{ display: "block" }} />}
                  </td>
                  <td>
                    <Link href={`/admin/articles/${p.id}`} className="adm-strong">{p.title}</Link>
                    <span className="adm-sub">/blog/{p.slug}</span>
                  </td>
                  <td>{p.category ?? "—"}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td>{formatDate(p.updatedAt)}</td>
                  <td>
                    <div className="adm-actions">
                      <Link href={`/admin/articles/${p.id}`} className="adm-btn adm-btn--sm">{Icons.edit}Modifier</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Empty title={filtered ? "Aucun article ne correspond" : "Aucun article pour l'instant"} text={filtered ? "Essayez un autre filtre." : "Créez le premier article du blog."}>
            <Link href="/admin/articles/nouveau" className="adm-btn adm-btn--primary adm-btn--sm">Nouvel article</Link>
          </Empty>
        )}
      </section>
    </>
  );
}
