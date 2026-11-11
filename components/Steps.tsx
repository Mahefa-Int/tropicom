"use client";

import { useEffect, useState } from "react";

/**
 * Les 5 temps de la méthode : pastilles numérotées.
 * Au clic, le détail s'affiche dans un panneau à droite (même hauteur, la page ne s'allonge pas),
 * relié à la pastille active par un trait jaune. Sur mobile, il s'ouvre sous la pastille (accordéon).
 * width = largeur de la pastille noire, pill = largeur de la pastille grise (px de la maquette).
 * À COMPLÉTER : text (paragraphe) et points (liste) de chaque temps.
 */
type Step = { n: string; label: string; width: number; pill: number; text: string; points: string[] };

const STEPS: Step[] = [
  { n: "01", label: "Diagnostic", width: 398, pill: 218, text: "", points: [] },
  { n: "02", label: "Blueprint", width: 345, pill: 199, text: "", points: [] },
  { n: "03", label: "Studio", width: 293, pill: 146, text: "", points: [] },
  { n: "04", label: "Activation", width: 345, pill: 195, text: "", points: [] },
  { n: "05", label: "Performance", width: 398, pill: 250, text: "", points: [] },
];

/** Contenu du détail : texte + points (partagé entre le panneau ordinateur et l'accordéon mobile). */
function StepContent({ step }: { step: Step }) {
  return (
    <>
      {step.text ? <p className="steps-detail-text">{step.text}</p> : <p className="steps-detail-text is-empty">Détail à venir.</p>}
      {step.points.length > 0 && (
        <ul className="steps-detail-points">
          {step.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function Steps() {
  const [active, setActive] = useState(-1); // aucun temps ouvert au départ (comme la maquette)
  const step = active >= 0 ? STEPS[active] : null;

  // clavier : flèches haut/bas pour changer de temps, Échap pour fermer
  useEffect(() => {
    if (active < 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(-1);
      else if (e.key === "ArrowDown" || e.key === "ArrowRight") setActive((a) => Math.min(STEPS.length - 1, a + 1));
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft") setActive((a) => Math.max(0, a - 1));
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    // état actif dans un attribut (et non dans className) : React ne doit pas effacer la classe .in-view
    // ajoutée par RevealObserver à l'apparition de la section
    <section className="steps" data-active={step ? "" : undefined} id="les-5-temps" data-reveal aria-label="Les 5 temps de la méthode">
      <ol className="steps-list">
        {STEPS.map((s, i) => (
          <li
            key={s.n}
            className={"step" + (i === active ? " is-active" : "")}
            style={{ "--w": s.width, "--pw": s.pill, "--i": i } as React.CSSProperties}
          >
            <button
              type="button"
              className="step-head"
              aria-pressed={i === active}
              aria-controls="step-detail"
              onClick={() => setActive(i === active ? -1 : i)}
            >
              <span className="step-num">{s.n}</span>
              <span className="step-pill">
                <span className="step-label">{s.label}</span>
                <svg className="step-chevron" viewBox="0 0 12 6" aria-hidden="true">
                  <path d="M1 1l5 4 5-4" />
                </svg>
              </span>
            </button>
            {/* mobile : le détail s'ouvre sous la pastille (accordéon) */}
            {i === active && (
              <div className="step-acc" id={`step-acc-${s.n}`}>
                <StepContent step={s} />
              </div>
            )}
          </li>
        ))}
      </ol>

      {/* trait jaune qui relie la pastille active au panneau */}
      {step && (
        <span
          key={"link-" + active}
          className="steps-link"
          aria-hidden="true"
          style={{ "--i": active, "--w": step.width } as React.CSSProperties}
        />
      )}

      {/* panneau de détail (à droite des pastilles) */}
      <aside id="step-detail" className="steps-detail" aria-live="polite" aria-hidden={!step}>
        {step && (
          <div key={step.n} className="steps-detail-in">
            <div className="steps-detail-top">
              <span className="steps-detail-count">
                <b>{step.n}</b> / 05
              </span>
              <button type="button" className="steps-detail-close" aria-label="Fermer le détail" onClick={() => setActive(-1)}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <h3 className="steps-detail-title">{step.label}</h3>
            <StepContent step={step} />
            <div className="steps-detail-nav">
              <button type="button" disabled={active === 0} onClick={() => setActive(active - 1)}>
                ‹ {active > 0 ? STEPS[active - 1].label : ""}
              </button>
              <button type="button" disabled={active === STEPS.length - 1} onClick={() => setActive(active + 1)}>
                {active < STEPS.length - 1 ? STEPS[active + 1].label : ""} ›
              </button>
            </div>
          </div>
        )}
      </aside>
    </section>
  );
}
