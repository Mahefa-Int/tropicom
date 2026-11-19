import type { CaseCard } from "@/lib/cases";
import CtaIcon from "./CtaIcon";
import RealisationsRibbon from "./RealisationsRibbon";

/**
 * Page « Nos réalisations » — liste des études de cas (maquette 1440 × 7042, barre de menu comprise).
 * Cartes 1328 × 640 (coins 32), une toutes les 704 px : image carrée 640 alternativement à gauche / à droite,
 * panneau #171616 (nom du client 44 px jaune doré en haut ; expertises 12 px et promesse 24 / 32 en bas).
 * Sur l'image : pastille « secteur · lieu », flèche blanche, carte du chiffre clé.
 * Dernière ligne : la dernière réalisation en petite carte (440 × 540) + bloc « Un enjeu comparable ? » (872 × 540).
 * Derrière les cartes : un ruban qui descend toute la page (RealisationsRibbon).
 * Contenu : réalisations publiées (admin → Réalisations), dans l'ordre d'affichage.
 */

function Arrow() {
  return (
    <span className="rl-arrow" aria-hidden="true">
      <svg viewBox="0 0 16 16">
        <path d="M5 11 11 5M6 5h5v5" />
      </svg>
    </span>
  );
}

function Media({ c, eager }: { c: CaseCard; eager?: boolean }) {
  return (
    <span className="rl-media">
      {c.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={c.image} alt="" loading={eager ? "eager" : "lazy"} />
      )}
      {c.pill && <span className="rl-pill">{c.pill}</span>}
      <Arrow />
      {c.stat && (
        <span className="rl-stat">
          <b>{c.stat}</b>
          {c.statText && <span>{c.statText}</span>}
        </span>
      )}
    </span>
  );
}

export default function RealisationsList({ cards }: { cards: CaseCard[] }) {
  const big = cards.slice(0, -1);
  const last = cards[cards.length - 1];

  return (
    <section className="rl" aria-label="Études de cas">
      {cards.length > 0 && <RealisationsRibbon big={big.length} />}
      <div className="rl-list">
        {big.map((c, i) => (
          <a key={c.href} href={c.href} className={"rl-card " + (i % 2 ? "is-right" : "is-left")} data-reveal>
            <Media c={c} eager={i === 0} />
            <span className="rl-body">
              <span className="rl-client">{c.client}</span>
              <span className="rl-bottom">
                {c.tags && <span className="rl-tags">{c.tags}</span>}
                <span className="rl-title">{c.title}</span>
              </span>
            </span>
          </a>
        ))}

        <div className={"rl-end" + (last ? "" : " is-solo")}>
          {last && (
            <a href={last.href} className="rl-small" data-reveal>
              <Media c={last} />
              <span className="rl-small-body">
                <span className="rl-small-client">{last.client}</span>
                <span className="rl-small-title">{last.title}</span>
                {last.tags && <span className="rl-small-tags">{last.tags}</span>}
              </span>
            </a>
          )}
          <section className="rl-cta" data-reveal aria-labelledby="rl-cta-t">
            <svg className="rl-cta-arrow" viewBox="0 0 872 540" aria-hidden="true">
              <path d="M603 373H827L718 273 748 241 918 397 748 553 718 521 827 421H603Z" />
            </svg>
            <p className="rl-cta-k">Votre projet ici ?</p>
            <h2 id="rl-cta-t">Un enjeu comparable ?</h2>
            <p className="rl-cta-p">Le diagnostic est offert.</p>
            <a href="/#contact" className="cta rl-cta-btn">
              <CtaIcon />
              <span className="cta-label">Demander un diagnostic</span>
            </a>
          </section>
        </div>
      </div>
    </section>
  );
}
