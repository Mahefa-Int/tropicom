import Link from "next/link";
import { desc, eq, like, or, and, type SQL } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/admin/dal";
import { formatDate } from "@/lib/admin/util";
import { Empty, PageHead, StatusBadge } from "@/components/admin/ui";
import { Icons } from "@/components/admin/icons";

export const metadata = { title: "Articles" };

export default async function PostsPage({ searchParams }: { searchParams: Promise<{ q?: string; statut?: string }> }) {
  await requireUser();
  const { q = "", statut = "" } = await searchParams;
  const where: SQL[] = [];
  if (q) where.push(or(like(schema.posts.title, `%${q}%`), like(schema.posts.category, `%${q}%`))!);
  if (statut === "draft" || statut === "published") where.push(eq(schema.posts.status, statut));
  const posts = await db
    .select()
    .from(schema.posts)
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(schema.posts.updatedAt));

  return (
    <>
      <PageHead title="Articles" text="Le blog du site : actualités, conseils, études.">
        <Link href="/admin/articles/nouveau" className="adm-btn adm-btn--primary">
          {Icons.plus}
          Nouvel article
        </Link>
      </PageHead>
      <section className="adm-card">
        <form style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <input name="q" className="adm-input" placeholder="Rechercher un titre, une catégorie…" defaultValue={q} style={{ maxWidth: 340 }} />
          <select name="statut" className="adm-select" defaultValue={statut} style={{ maxWidth: 170 }}>
            <option value="">Tous les statuts</option>
            <option value="published">Publiés</option>
            <option value="draft">Brouillons</option>
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
          <Empty title={q || statut ? "Aucun article ne correspond" : "Aucun article pour l'instant"} text={q || statut ? "Essayez un autre filtre." : "Créez le premier article du blog."}>
            <Link href="/admin/articles/nouveau" className="adm-btn adm-btn--primary adm-btn--sm">Nouvel article</Link>
          </Empty>
        )}
      </section>
    </>
  );
}
