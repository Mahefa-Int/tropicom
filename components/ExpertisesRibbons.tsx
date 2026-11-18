/**
 * Page « Expertises » — deux rubans qui se croisent sous le haut de page (maquette 1440 × 236).
 * Jaune (#f7c227, incliné de -2,07°, devant) : les 5 pôles. Bleu ca (#3e9d9e, +2,5°, derrière) : le parcours du voyageur.
 * Mots DM Sans 600, 38 px, -6 %, noirs ; séparateurs carrés de 9 px. Défilement continu en sens opposés.
 */
const POLES = ["Marque", "Contenu", "Acquisition", "Academy", "Labs"];
const JOURNEY = ["Découvrir", "Comparer", "Douter", "Lire les avis", "Revenir", "Réserver"];

function Track({ words }: { words: string[] }) {
  // deux copies identiques : la piste défile de -50 % puis recommence, sans saut
  const list = [...words, ...words, ...words];
  return (
    <div className="exr-track">
      {[0, 1].map((copy) => (
        <span className="exr-run" key={copy} aria-hidden={copy === 1 ? true : undefined}>
          {list.map((w, i) => (
            <span className="exr-item" key={i}>
              <span className="exr-word">{w}</span>
              <i className="exr-sep" />
            </span>
          ))}
        </span>
      ))}
    </div>
  );
}

export default function ExpertisesRibbons() {
  return (
    <section className="exr" aria-label="Nos pôles et le parcours du voyageur">
      <div className="exr-band exr-band--teal">
        <Track words={JOURNEY} />
      </div>
      <div className="exr-band exr-band--yellow">
        <Track words={POLES} />
      </div>
    </section>
  );
}
