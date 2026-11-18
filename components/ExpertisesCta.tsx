import CtaIcon from "./CtaIcon";

/**
 * Page « Expertises » — appel à l'action final (maquette 1440 × 324).
 * Carte #707070 à 16 px des bords, arrondi 32 ; « PARLONS DE / VOTRE MAISON. » DM Sans 550 108 / 98, -8,5 %, noir ;
 * à droite, texte 19 / 30 et bouton « Entrer en contact » (vers le pied de page, #contact).
 */
export default function ExpertisesCta() {
  return (
    <section className="exc" data-reveal aria-labelledby="exc-title">
      <h2 className="exc-title" id="exc-title">
        <span className="exc-line">
          <span>PARLONS DE</span>
        </span>
        <span className="exc-line">
          <span>VOTRE MAISON.</span>
        </span>
      </h2>
      <p className="exc-text">
        Un premier échange pour situer vos besoins <br />
        parmi nos cinq expertises.
      </p>
      <a href="#contact" className="cta exc-cta">
        <CtaIcon />
        <span className="cta-label">Entrer en contact</span>
      </a>
    </section>
  );
}
