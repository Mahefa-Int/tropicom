"use client";

import { useState } from "react";

/**
 * FAQ « On répond à vos questions. » (après l'Observatoire).
 * Maquette 1440 × 1132 : titre 72 / 64 en (64, 100), étiquette + « graphic point » en haut à droite,
 * 6 questions en pilules 1312 × 110 (radius 55, fond #171616, 16 d'écart) à partir de y 292,
 * bouton rond magenta 48 px avec un « + ». Une seule réponse ouverte à la fois (le « + » devient « × »).
 * À COMPLÉTER : les réponses (lorem ipsum en attendant le texte).
 */
// réponses à fournir : texte provisoire
const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

const FAQ = [
  {
    q: "Travaillez-vous avec des établissements hors de Madagascar ?",
    a: LOREM,
  },
  {
    q: "Quel budget faut-il prévoir ?",
    a: LOREM,
  },
  {
    q: "Sous combien de temps voit-on des résultats ?",
    a: LOREM,
  },
  {
    q: "Faut-il tout arrêter avec les OTA ?",
    a: LOREM,
  },
  {
    q: "Pouvez-vous former nos équipes plutôt que tout gérer ?",
    a: LOREM,
  },
  {
    q: "Vos outils d'IA sont-ils conformes au RGPD ?",
    a: LOREM,
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="faq" id="faq" data-reveal aria-labelledby="faq-title">
      <p className="faq-tag">
        <span className="dot" aria-hidden="true"></span>FAQ
      </p>
      <h2 className="faq-title" id="faq-title">
        ON RÉPOND À VOS <br />
        QUESTIONS.
      </h2>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="faq-traits" src="/images/faq/graphic-point.webp" alt="" width={134} height={48} />

      <ul className="faq-list">
        {FAQ.map((item, i) => {
          const isOpen = open === i;
          return (
            <li key={i} className="faq-item" data-open={isOpen ? "" : undefined} style={{ "--k": i } as React.CSSProperties}>
              <button
                type="button"
                className="faq-q"
                aria-expanded={isOpen}
                aria-controls={"faq-a-" + i}
                id={"faq-q-" + i}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span>{item.q}</span>
                <span className="faq-plus" aria-hidden="true"></span>
              </button>
              <div className="faq-a" id={"faq-a-" + i} role="region" aria-labelledby={"faq-q-" + i}>
                <div>
                  <p>{item.a}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
