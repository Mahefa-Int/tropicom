const PARTNERS = [
  "Tourisme Artisanat", "Alizé Voyages", "Iendriko", "Le Boulanger", "Ulahara Café", "Lenka", "JK'Hay",
  "Havoana Land", "Zà Bibikely", "BiJor", "Confédération du Tourisme de Madagascar", "Veezit", "Ortana",
  "ORTVak", "CanCham", "Nature & Culture Madagascar", "GassyTour", "Rencontre avec Dago", "Globatlas",
  "Aventure Madagascar",
];

/** « Ils nous ont fait confiance » : ruban + bande de logos qui défile. */
export default function Trust() {
  return (
    <section className="trust" id="references" data-reveal>
      {/* Image : /images/confiance-ruban.png */}
      <div className="trust-ribbon" aria-hidden="true"></div>
      <h2 className="trust-title">
        <span>Ils nous ont</span>
        <span>fait confiance</span>
      </h2>
      {/* Image : /images/confiance-logos-partenaires.png (20 logos de 64 × 64) */}
      <div className="trust-strip" role="img" aria-label={`Logos de nos partenaires : ${PARTNERS.join(", ")}`}>
        <div className="trust-track"></div>
      </div>
    </section>
  );
}
