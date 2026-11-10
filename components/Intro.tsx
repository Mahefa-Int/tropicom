/** Section noire d'introduction (apparition gérée par RevealObserver via data-reveal). */
export default function Intro() {
  return (
    <section className="intro" id="intro" data-reveal>
      <h2 className="intro-title">
        <span className="intro-row">
          <span className="w"><span>Votre établissement</span></span>
          {/* Image : /images/intro-ananas.png */}
          <span className="pill pill-ananas"><span className="pill-img"></span></span>
          <span className="w muted"><span>est exceptionnel.</span></span>
        </span>
        <span className="intro-row">
          <span className="w"><span>Sa visibilité</span></span>
          {/* Image : /images/intro-coco.png */}
          <span className="pill pill-coco"><span className="pill-img"></span></span>
          <span className="w"><span>ne l&apos;est pas encore.</span></span>
        </span>
      </h2>

      <div className="intro-cols">
        <p>
          Un lieu rare. Une équipe qui fait la différence. Des voyageurs qui repartent conquis et le disent.<br />
          Et pourtant. La basse saison creuse vos taux d&apos;occupation. Les plateformes prélèvent leur part sur chaque nuitée.
          Votre site reçoit des visites mais génère peu de demandes. Vos réseaux sociaux attirent des curieux, rarement des
          clients. Et vos meilleurs avis dorment sans réponse.
        </p>
        <div>
          <p>
            Le problème n&apos;est pas votre offre. C&apos;est la distance entre ce que vous valez et ce que le voyageur
            perçoit avant de réserver.
          </p>
          <p>Nous existons pour supprimer cette distance.</p>
        </div>
      </div>
    </section>
  );
}
