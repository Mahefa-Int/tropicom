/** « Ce que ça change, concrètement. » — en-tête de la partie preuves (apparition via data-reveal). */
export default function Proof() {
  return (
    <section className="proof" id="preuves" data-reveal>
      <h2 className="proof-title">
        <span className="line"><span>CE QUE ÇA CHANGE,</span></span>
        <span className="line line-muted"><span>CONCRÈTEMENT.</span></span>
      </h2>
      <p className="proof-sub">Trois etablissements, trois points de départ, trois résultats mesurés sur douze mois.</p>

      <p className="proof-tag">
        <span className="dot" aria-hidden="true"></span>Preuve
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="proof-traits" src="/images/graphic-point.png" alt="" width={64} height={32} />

      {/* Coin arrondi décoratif (trait fin qui se dessine) */}
      <svg className="proof-corner" viewBox="0 0 125 125" aria-hidden="true">
        <path d="M0 0.5 H75 A49.5 49.5 0 0 1 124.5 50 V125" pathLength={1} />
      </svg>
    </section>
  );
}
