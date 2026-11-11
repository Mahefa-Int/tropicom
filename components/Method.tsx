/**
 * « Cinq temps. Zéro improvisation. » — en-tête de la partie méthode.
 * Même construction et mêmes animations que la section Preuves (classes .proof-*),
 * positions propres à cette maquette dans .method (globals.css).
 */
export default function Method() {
  return (
    <section className="proof method" id="methode" data-reveal>
      <h2 className="proof-title">
        <span className="line"><span>CINQ TEMPS. ZÉRO</span></span>
        <span className="line"><span>IMPROVISATION.</span></span>
      </h2>
      <p className="proof-sub">
        Une saison se prépare, elle ne se rattrape pas. Notre processus est calé sur votre{" "}
        <br />
        calendrier commercial : nous remontons à rebours de votre haute saison pour savoir{" "}
        <br />
        quand chaque chose doit être prête.
      </p>

      <p className="proof-tag">
        <span className="dot" aria-hidden="true"></span>La méthode
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="proof-traits" src="/images/traits-jaunes.png" alt="" width={62} height={28} />

      {/* Coin arrondi décoratif (trait fin qui se dessine) */}
      <svg className="proof-corner" viewBox="0 0 125 125" aria-hidden="true">
        <path d="M0 0.5 H75 A49.5 49.5 0 0 1 124.5 50 V125" pathLength={1} />
      </svg>
    </section>
  );
}
