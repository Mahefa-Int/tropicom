/**
 * Page « L'Agence » — deux cartes-liens : « Rencontrer l'équipe » et « Nous rejoindre ».
 * Maquette 1440 × 430 : carte grise #707070 (64, 64) 656 × 302, coins 28 ; carte noire #171616 (716, 64) 660 × 302,
 * qui recouvre légèrement la première. Titres DM Sans 500 70 / 64 (−3,5 %) ; petits intitulés ~15 px ;
 * 5 pastilles d'équipe (45 px, recouvrement 12) ; soleil jaune ; bouton rond 64 px avec une flèche ↗.
 * Au survol : la carte s'avance, la flèche part en diagonale et revient, les pastilles s'écartent / le soleil se lève.
 * À COMPLÉTER : liens des deux cartes, photos de l'équipe dans les pastilles.
 */
function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

export default function AgencyJoin() {
  return (
    <section className="agj" data-reveal aria-label="L'équipe et les carrières">
      <a href="/agence/notre-histoire" className="agj-card agj-card--team">
        <span className="agj-tag">L&apos;ÉQUIPE · 18 SPÉCIALISTES</span>
        <span className="agj-faces" aria-hidden="true">
          {Array.from({ length: 5 }, (_, i) => (
            <i key={i} style={{ "--i": i } as React.CSSProperties}></i>
          ))}
        </span>
        <span className="agj-title">
          RENCONTRER
          <br />
          L&apos;ÉQUIPE
        </span>
        <span className="agj-btn">
          <Arrow />
        </span>
      </a>

      <a href="/agence/carrieres" className="agj-card agj-card--jobs">
        <span className="agj-tag">CARRIÈRES</span>
        <svg className="agj-sun" viewBox="1262 86 92 48" aria-hidden="true">
          <g className="agj-rays" stroke="#f7c227" strokeWidth="2" strokeLinecap="round">
            <path d="M1308 91.5v8.8" />
            <path d="M1283.8 101.5l5.5 5.5" />
            <path d="M1332.3 101.5l-5.5 5.5" />
            <path d="M1272 118h7" />
            <path d="M1337 118h7" />
          </g>
          <clipPath id="agjHorizon">
            <rect x="1262" y="86" width="92" height="45" />
          </clipPath>
          <g clipPath="url(#agjHorizon)">
            <circle className="agj-disc" cx="1308" cy="130.5" r="20" fill="#f7c227" />
          </g>
          <path d="M1266 131h84" stroke="#000" strokeWidth="1.2" />
        </svg>
        <span className="agj-title">
          NOUS
          <br />
          REJOINDRE
        </span>
        <span className="agj-btn">
          <Arrow />
        </span>
      </a>
    </section>
  );
}
