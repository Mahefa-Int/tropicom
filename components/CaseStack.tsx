"use client";

import CaseStackScroll from "@/components/ui/case-stack-scroll";

/**
 * Études de cas en « paquet de cartes » au défilement (une carte par écran, scène épinglée sous le menu).
 * Les 3 cartes (Grand Hotel Diego, Echoes of the Forest, Calumma Travel Madagascar)
 * sont définies dans components/ui/case-stack-scroll.tsx (CARDS).
 */
export default function CaseStack() {
  return (
    <div className="case-stack" id="etudes-de-cas">
      {/* top : hauteur du menu fixe */}
      <CaseStackScroll top={72} />
    </div>
  );
}
