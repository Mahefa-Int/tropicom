import Link from "next/link";
import { count, desc, eq, gte, sum } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/admin/dal";
import { formatDate, formatDateTime } from "@/lib/admin/util";
import { Empty, LineChart, PageHead, StatusBadge } from "@/components/admin/ui";
import { Icons } from "@/components/admin/icons";

export const metadata = { title: "Tableau de bord" };

// couleur pleine du demi-cercle, assortie à la tache de chaque carte
const SOLID: Record<string, string> = {"rgba(70,167,88,.3)": "#46a758", "rgba(62,157,158,.35)": "#3e9d9e", "rgba(247,194,39,.3)": "#f7c227", "rgba(222,11,125,.3)": "#de0b7d"};

export default async function Dashboard() {
  const user = await requireUser();
  const since = new Date(Date.now() - 28 * 864e5).toISOString().slice(0, 10);

  const [[published], [drafts], [cases], [unread], [mediaCount], lastMessages, lastPosts, gsc, [gscTotal]] = await Promise.all([
    db.select({ n: count() }).from(schema.posts).where(eq(schema.posts.status, "published")),
    db.select({ n: count() }).from(schema.posts).where(eq(schema.posts.status, "draft")),
    db.select({ n: count() }).from(schema.caseStudies),
    db.select({ n: count() }).from(schema.messages).where(eq(schema.messages.isRead, false)),
    db.select({ n: count() }).from(schema.media),
    db.select().from(schema.messages).orderBy(desc(schema.messages.createdAt)).limit(5),
    db.select().from(schema.posts).orderBy(desc(schema.posts.updatedAt)).limit(5),
    db.select().from(schema.gscDaily).where(gte(schema.gscDaily.day, since)).orderBy(schema.gscDaily.day),
    db.select({ clicks: sum(schema.gscDaily.clicks), impressions: sum(schema.gscDaily.impressions) }).from(schema.gscDaily).where(gte(schema.gscDaily.day, since)),
  ]);

  const stats = [
    { label: "Articles publiés", value: published.n, sub: `${drafts.n} brouillon${drafts.n > 1 ? "s" : ""}`, glow: "rgba(70,167,88,.3)" },
    { label: "Réalisations", value: cases.n, sub: "études de cas", glow: "rgba(62,157,158,.35)" },
    { label: "Messages non lus", value: unread.n, sub: "à traiter", glow: "rgba(247,194,39,.3)" },
    { label: "Clics Google (28 j)", value: Number(gscTotal.clicks ?? 0), sub: `${Number(gscTotal.impressions ?? 0).toLocaleString("fr-FR")} impressions`, glow: "rgba(222,11,125,.3)" },
  ];

  return (
    <>
      <PageHead title={`Bonjour ${user.name.split(" ")[0]}`} text="Voici ce qui se passe sur le site.">
        <Link href="/admin/articles/nouveau" className="adm-btn adm-btn--primary">
          {Icons.plus}
          Nouvel article
        </Link>
      </PageHead>

      <div className="adm-grid adm-grid--stats" style={{ marginBottom: 16 }}>
        {stats.map((s) => (
          <div key={s.label} className="adm-card adm-stat" style={{ "--glow": s.glow, "--solid": SOLID[s.glow] } as React.CSSProperties}>
            <small>{s.label}</small>
            <b>{s.value.toLocaleString("fr-FR")}</b>
            <span>{s.sub}</span>
          </div>
        ))}
      </div>

      <div className="adm-grid adm-grid--2">
        <section className="adm-card">
          <h2>Clics depuis Google — 28 derniers jours</h2>
          {gsc.length ? (
            <LineChart points={gsc.map((d) => ({ label: d.day, value: d.clicks }))} />
          ) : (
            <Empty title="Search Console pas encore connectée" text="Les courbes apparaîtront après la mise en ligne et la connexion à Google.">
              <Link href="/admin/statistiques" className="adm-btn adm-btn--sm">Voir la marche à suivre</Link>
            </Empty>
          )}
        </section>

        <section className="adm-card">
          <h2>Derniers messages</h2>
          {lastMessages.length ? (
            <table className="adm-table">
              <tbody>
                {lastMessages.map((m) => (
                  <tr key={m.id} className={m.isRead ? undefined : "adm-msg-unread"}>
                    <td>
                      <Link href={`/admin/messages/${m.id}`} className="adm-strong">{m.name}</Link>
                      <span className="adm-sub">{m.subject || m.body.slice(0, 60)}</span>
                    </td>
                    <td style={{ textAlign: "right", color: "var(--a-muted)", fontSize: 12 }}>{formatDateTime(m.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <Empty title="Aucun message" text="Les demandes envoyées depuis le site arriveront ici." />
          )}
        </section>

        <section className="adm-card" style={{ gridColumn: "1 / -1" }}>
          <h2>Articles récents</h2>
          {lastPosts.length ? (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Statut</th>
                  <th>Modifié</th>
                </tr>
              </thead>
              <tbody>
                {lastPosts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/admin/articles/${p.id}`} className="adm-strong">{p.title}</Link>
                    </td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>{formatDate(p.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <Empty title="Aucun article pour l'instant">
              <Link href="/admin/articles/nouveau" className="adm-btn adm-btn--primary adm-btn--sm">Écrire le premier</Link>
            </Empty>
          )}
          <p style={{ margin: "12px 0 0", color: "var(--a-muted)", fontSize: 12 }}>{mediaCount.n} image{mediaCount.n > 1 ? "s" : ""} dans la médiathèque.</p>
        </section>
      </div>
    </>
  );
}
