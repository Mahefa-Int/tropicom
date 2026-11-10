"use client";

import CaseStackScroll from "@/components/ui/case-stack-scroll";

/**
 * Études de cas en pile 3D (d'après le composant 21st.dev « case-stack-scroll »).
 * Les 3 cartes (Grand Hotel Diego, Echoes of the Forest, Calumma Travel Madagascar)
 * sont définies dans components/ui/case-stack-scroll.tsx (CARDS).
 */
export default function CaseStack() {
  return (
    <section className="case-stack" id="etudes-de-cas">
      {/* hauteur : l'écran moins le menu fixe (72 px) ; sans libellés à gauche / à droite ; textes vides : ni bouton « Voir toutes les études de cas », ni texte en bas à gauche */}
      <CaseStackScroll ctaLabel="" tagline={["", ""]} showLabels={false} height="calc(100svh - 72px)" />
    </section>
  );
}
