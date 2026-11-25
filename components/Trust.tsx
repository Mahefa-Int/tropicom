/**
 * « Ils nous ont fait confiance » : ruban + bande de logos qui défile en continu (pause au survol).
 * Logos : /images/confiance/*.webp (vignettes 128 × 128 générées depuis sources-images/partenaires).
 */
const PARTNERS: [string, string][] = [
  ["Ministère du Tourisme et de l'Artisanat", "ministere-tourisme-artisanat"],
  ["Globatlas", "globatlas"],
  ["Aventour Madagascar", "aventour-madagascar"],
  ["L'Odyssée", "l-odyssee"],
  ["Maison Lovasoa", "maison-lovasoa"],
  ["Tana Boutique Hotel", "tana-boutique-hotel"],
  ["Auboisvert Lodge", "auboisvert-lodge"],
  ["Lemurs Lodge", "lemurs-lodge"],
  ["JL", "jl"],
  ["Confédération du Tourisme de Madagascar", "confederation-tourisme-madagascar"],
  ["Mangoro Hotel", "mangoro-hotel"],
  ["Haody Madagascar", "haody-madagascar"],
  ["Le Grand Hôtel", "le-grand-hotel"],
  ["Antsanitia Resort", "antsanitia-resort"],
  ["Jardin Maore", "jardin-maore"],
  ["Corail Noir", "corail-noir"],
  ["AREMEC", "aremec"],
  ["Dart Group", "dart-group"],
  ["Grand Café de la Gare", "grand-cafe-de-la-gare"],
  ["Veezit", "veezit"],
  ["Institut d'Excellence Culinaire Guillaume Gomez", "institut-excellence-culinaire"],
  ["Le Dragon Rouge", "le-dragon-rouge"],
  ["Boba Bee", "boba-bee"],
  ["Café du Musée", "cafe-du-musee"],
  ["Café-Bistro du Grand Soavina", "cafe-bistro-grand-soavina"],
  ["Le Boulanger", "le-boulanger"],
  ["Valahara Café", "valahara-cafe"],
  ["Soavana", "soavana"],
  ["Lenka", "lenka"],
  ["Iendriko", "iendriko"],
  ["Ortana", "ortana"],
  ["BiJor", "bijor"],
  ["Havoana Land", "havoana-land"],
  ["Zà Bibikely", "za-bibikely"],
  ["ORTVak", "ortvak"],
  ["CanCham", "cancham"],
  ["Nature & Culture Madagascar", "nature-culture-madagascar"],
  ["GassyTour", "gassytour"],
  ["Rencontre avec Dago", "rencontre-avec-dago"],
  ["Dimitile Hôtel & Spa", "dimitile"],
  ["SC", "sc"],
  ["Alizé Voyages", "alize-voyages"],
  ["Calumma Travel", "calumma-travel"],
  ["Echoes of the Forest", "echoes-of-the-forest"],
  ["ARICS Tours", "arics-tours"],
];

export default function Trust() {
  return (
    <section className="trust" id="references" data-reveal>
      {/* Image : /images/confiance-ruban.png */}
      <div className="trust-ribbon" aria-hidden="true"></div>
      <h2 className="trust-title">
        <span>Ils nous ont</span>
        <span>fait confiance</span>
      </h2>
      <div className="trust-strip">
        {/* deux fois la même suite : le défilement boucle sans saut */}
        <ul className="trust-track" style={{ "--n": PARTNERS.length } as React.CSSProperties}>
          {[0, 1].map((k) =>
            PARTNERS.map(([name, slug]) => (
              <li key={k + slug} aria-hidden={k === 1 || undefined}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/images/confiance/${slug}.webp`} alt={k === 0 ? name : ""} width={64} height={64} loading="lazy" title={name} />
              </li>
            )),
          )}
        </ul>
      </div>
    </section>
  );
}
