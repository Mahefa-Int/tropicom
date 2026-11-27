import type { Metadata } from "next";
import RippleHover from "@/components/RippleHover";
import InkHover from "@/components/InkHover";
import HoverFx, { type HoverFxEffect } from "@/components/HoverFx";
import MenuDemos from "@/components/MenuDemos";
import MethodBlock from "@/components/MethodBlock";
import RevealObserver from "@/components/RevealObserver";

/** Page de test (non liée dans le menu) : comparaison des effets au survol. */
export const metadata: Metadata = { title: "Essai effets", robots: { index: false } };

const SRC = "/images/agence/equipe.webp";

const FX: { effect: HoverFxEffect; title: string; hint: string }[] = [
  { effect: "lens", title: "2. Loupe liquide", hint: "une goutte transparente suit la souris et grossit l'image" },
  { effect: "scatter", title: "3. Pixels qui se dispersent", hint: "l'image se défait en carrés autour de la souris" },
  { effect: "rgb", title: "4. Décalage RGB", hint: "bougez vite : les couleurs se séparent" },
  { effect: "reveal", title: "5. Révélation couleur au pinceau", hint: "noir et blanc, la souris peint la couleur" },
  { effect: "wind", title: "6. Vent dans la toile", hint: "ondule en continu, plus fort sous la souris" },
];

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="essai-frame">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={SRC} alt="" />
      {children}
    </div>
  );
}

export default function EssaiPage() {
  return (
    <>
    <main className="essai">
      <h1>Mis de côté : « Cinq temps. Zéro improvisation. » (retiré de l&apos;accueil)</h1>
    </main>
    <MethodBlock />
    <main className="essai">
      <h1>Essai : sous-menu « L&apos;Agence »</h1>
      <MenuDemos />
      <h1 className="essai-h1-2">Essai : effets au survol</h1>
      <section>
        <h2>
          1. Ondulation d&apos;eau <small>survol = vaguelettes, clic = grosse goutte</small>
        </h2>
        <Frame>
          <RippleHover src={SRC} className="essai-canvas" />
        </Frame>
      </section>
      {FX.map((f) => (
        <section key={f.effect}>
          <h2>
            {f.title} <small>{f.hint}</small>
          </h2>
          <Frame>
            <HoverFx src={SRC} effect={f.effect} className="essai-canvas" />
          </Frame>
        </section>
      ))}
      <section>
        <h2>
          Pour comparer : encre <small>effet actuel de « L&apos;Agence »</small>
        </h2>
        <Frame>
          <InkHover src={SRC} className="essai-canvas" />
        </Frame>
      </section>
    </main>
    <RevealObserver />
    </>
  );
}
