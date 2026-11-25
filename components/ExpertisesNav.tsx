import { EXPERTISES, expertiseHref, pad2 } from "@/lib/expertises";

/**
 * Liens vers les pages des expertises : grille de cartes (photo, numéro, nom, accroche).
 * Sur /expertises : les 5 (« Nos expertises ») ; sur une page d'expertise : les 4 autres + lien vers la vue d'ensemble.
 */
export default function ExpertisesNav({ current, id }: { current?: string; id?: string }) {
  const items = EXPERTISES.filter((e) => e.slug !== current);
  return (
    <section className={"exn" + (current ? " is-others" : "")} id={id} aria-labelledby="exn-title" data-reveal>
      <header className="exn-head">
        <h2 id="exn-title">{current ? "Les autres expertises" : "Nos cinq expertises"}</h2>
        {current && (
          <a href="/expertises" className="exn-all">
            Vue d’ensemble
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M5 11 11 5M6 5h5v5" />
            </svg>
          </a>
        )}
      </header>
      <ul className="exn-grid">
        {items.map((e, i) => (
          <li key={e.slug} style={{ "--i": i } as React.CSSProperties}>
            <a href={expertiseHref(e.slug)} className="exn-card">
              <span className="exn-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={e.img} alt="" loading="lazy" />
                <span className="exn-arrow" aria-hidden="true">
                  <svg viewBox="0 0 16 16">
                    <path d="M5 11 11 5M6 5h5v5" />
                  </svg>
                </span>
              </span>
              <span className="exn-n">Pôle {pad2(e.n)}</span>
              <span className="exn-label">{e.label}</span>
              <span className="exn-promise">{e.promise}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
