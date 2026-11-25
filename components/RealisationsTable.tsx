import type { CaseCard } from "@/lib/cases";

/**
 * Page Réalisations — « Études & résultats » : grille de cartes (2 colonnes, 1 sur mobile).
 * Carte : grande image (pastille « secteur · lieu », flèche blanche, chiffre clé) ; dessous, en deux colonnes :
 * nom du client et pastille du secteur à gauche, description (promesse) à droite. Au survol : l'image zoome légèrement, la flèche tourne, le chiffre remonte.
 * Apparition au défilement, les cartes de droite légèrement décalées.
 */
export default function RealisationsTable({ cards }: { cards: CaseCard[] }) {
  return (
    <section className="rtb" aria-labelledby="rtb-title">
      <header className="rtb-head-block">
        <h2 className="rtb-title" id="rtb-title">
          Études <em>&amp; résultats.</em>
        </h2>
        <p className="rtb-note">
          {cards.length} projets, en trois temps : le point de départ, ce que nous avons fait, ce que ça a produit.
        </p>
      </header>

      <ul className="rtb-grid">
        {cards.map((c, i) => (
          <li key={c.href} data-reveal style={{ "--d": `${(i % 2) * 0.12}s` } as React.CSSProperties}>
            <a href={c.href} className="rtb-card">
              <span className="rtb-media">
                {c.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image} alt="" loading="lazy" />
                ) : (
                  <span className="rtb-noimg">{c.client}</span>
                )}
                {c.pill && <span className="rtb-pill">{c.pill}</span>}
                <span className="rtb-arrow" aria-hidden="true">
                  <svg viewBox="0 0 16 16">
                    <path d="M5 11 11 5M6 5h5v5" />
                  </svg>
                </span>
                {c.stat && (
                  <span className="rtb-stat">
                    <b>{c.stat}</b>
                    {c.statText && <span>{c.statText}</span>}
                  </span>
                )}
              </span>
              <span className="rtb-body">
                <span className="rtb-id">
                  <span className="rtb-client">{c.client}</span>
                  {c.sector && <span className="rtb-sector">{c.sector}</span>}
                </span>
                <span className="rtb-promise">{c.title}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
