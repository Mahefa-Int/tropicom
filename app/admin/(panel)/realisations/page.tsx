import Link from "next/link";
import { asc, desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/admin/dal";
import { formatDate } from "@/lib/admin/util";
import { Empty, PageHead, StatusBadge } from "@/components/admin/ui";
import { Icons } from "@/components/admin/icons";

export const metadata = { title: "Réalisations" };

export default async function CasesPage() {
  await requireUser();
  const items = await db.select().from(schema.caseStudies).orderBy(asc(schema.caseStudies.sortOrder), desc(schema.caseStudies.updatedAt));
  return (
    <>
      <PageHead title="Réalisations" text="Les études de cas : situation, réponse, résultats.">
        <Link href="/admin/realisations/nouvelle" className="adm-btn adm-btn--primary">
          {Icons.plus}
          Nouvelle réalisation
        </Link>
      </PageHead>
      <section className="adm-card">
        {items.length ? (
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: 70 }} />
                <th>Étude de cas</th>
                <th>Secteur</th>
                <th>Ordre</th>
                <th>Statut</th>
                <th>Modifiée</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {c.coverUrl ? <img className="adm-thumb" src={c.coverUrl} alt="" /> : <span className="adm-thumb" style={{ display: "block" }} />}
                  </td>
                  <td>
                    <Link href={`/admin/realisations/${c.id}`} className="adm-strong">{c.title}</Link>
                    <span className="adm-sub">{[c.client, c.location].filter(Boolean).join(" · ") || "—"}</span>
                  </td>
                  <td>{c.sector ?? "—"}</td>
                  <td>{c.sortOrder}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>{formatDate(c.updatedAt)}</td>
                  <td>
                    <div className="adm-actions">
                      <Link href={`/admin/realisations/${c.id}`} className="adm-btn adm-btn--sm">{Icons.edit}Modifier</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Empty title="Aucune réalisation pour l'instant" text="Ajoutez les études de cas qui apparaîtront sur la page Réalisations.">
            <Link href="/admin/realisations/nouvelle" className="adm-btn adm-btn--primary adm-btn--sm">Nouvelle réalisation</Link>
          </Empty>
        )}
      </section>
    </>
  );
}
