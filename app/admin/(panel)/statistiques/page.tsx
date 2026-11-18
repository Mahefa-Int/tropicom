import { desc, gte, sum, avg } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/admin/dal";
import { LineChart, PageHead } from "@/components/admin/ui";
import { Icons } from "@/components/admin/icons";

export const metadata = { title: "Statistiques" };

const PERIODS = [7, 28, 90];

// couleur pleine du demi-cercle, assortie à la tache de chaque carte
const SOLID: Record<string, string> = {"rgba(70,167,88,.3)": "#46a758", "rgba(62,157,158,.35)": "#3e9d9e", "rgba(247,194,39,.3)": "#f7c227", "rgba(222,11,125,.3)": "#de0b7d"};

export default async function StatsPage({ searchParams }: { searchParams: Promise<{ j?: string }> }) {
  await requireUser();
  const { j } = await searchParams;
  const days = PERIODS.includes(Number(j)) ? Number(j) : 28;
  const since = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);
  const [rows, [tot], [last]] = await Promise.all([
    db.select().from(schema.gscDaily).where(gte(schema.gscDaily.day, since)).orderBy(schema.gscDaily.day),
    db
      .select({ clicks: sum(schema.gscDaily.clicks), impressions: sum(schema.gscDaily.impressions), position: avg(schema.gscDaily.position) })
      .from(schema.gscDaily)
      .where(gte(schema.gscDaily.day, since)),
    db.select({ day: schema.gscDaily.day }).from(schema.gscDaily).orderBy(desc(schema.gscDaily.day)).limit(1),
  ]);
  const clicks = Number(tot.clicks ?? 0);
  const impressions = Number(tot.impressions ?? 0);
  const ctr = impressions ? (clicks / impressions) * 100 : 0;
  const position = Number(tot.position ?? 0);

  const cards = [
    { label: "Clics", value: clicks.toLocaleString("fr-FR"), glow: "rgba(247,194,39,.3)" },
    { label: "Impressions", value: impressions.toLocaleString("fr-FR"), glow: "rgba(62,157,158,.35)" },
    { label: "Taux de clic", value: `${ctr.toFixed(1).replace(".", ",")} %`, glow: "rgba(70,167,88,.3)" },
    { label: "Position moyenne", value: position ? position.toFixed(1).replace(".", ",") : "—", glow: "rgba(222,11,125,.3)" },
  ];

  return (
    <>
      <PageHead title="Statistiques" text="Visibilité du site dans la recherche Google (Search Console).">
        {PERIODS.map((p) => (
          <a key={p} href={`?j=${p}`} className={"adm-btn adm-btn--sm" + (p === days ? "" : " adm-btn--ghost")}>
            {p} jours
          </a>
        ))}
      </PageHead>

      {!rows.length && (
        <div className="adm-notice" style={{ marginBottom: 16 }}>
          {Icons.info}
          <div>
            <b>Search Console n&apos;est pas encore connectée.</b>
            <ol>
              <li>Mettre le site en ligne et le valider dans Google Search Console (propriété « Domaine », enregistrement TXT chez PlanetHoster).</li>
              <li>Créer un compte de service Google Cloud et activer l&apos;API Search Console.</li>
              <li>Ajouter ce compte comme utilisateur (lecture) de la propriété Search Console.</li>
              <li>Renseigner la clé sur le serveur : la synchronisation quotidienne remplira ces tableaux.</li>
            </ol>
          </div>
        </div>
      )}

      <div className="adm-grid adm-grid--stats" style={{ marginBottom: 16 }}>
        {cards.map((c) => (
          <div key={c.label} className="adm-card adm-stat" style={{ "--glow": c.glow, "--solid": SOLID[c.glow] } as React.CSSProperties}>
            <small>{c.label}</small>
            <b>{c.value}</b>
            <span>{days} derniers jours</span>
          </div>
        ))}
      </div>

      <section className="adm-card" style={{ marginBottom: 16 }}>
        <h2>Clics par jour</h2>
        <LineChart points={rows.map((r) => ({ label: r.day, value: r.clicks }))} />
      </section>
      <section className="adm-card">
        <h2>Impressions par jour</h2>
        <LineChart points={rows.map((r) => ({ label: r.day, value: r.impressions }))} color="#3e9d9e" />
        <p style={{ margin: "10px 0 0", color: "var(--a-muted)", fontSize: 12 }}>
          {last ? `Dernière donnée : ${last.day} (Google publie avec 2 à 3 jours de décalage).` : "Aucune donnée pour l'instant."}
        </p>
      </section>
    </>
  );
}
