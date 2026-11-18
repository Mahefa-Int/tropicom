"use client";

/**
 * Pile d'images (« Image Stack », 21st.dev), adaptée au site :
 * - pas de Tailwind dans le projet → classes CSS du site (passées en props) ;
 * - <img> simple (images dans /public) ;
 * - pilotable de l'extérieur (flèches, points) : `order` = ordre des cartes, la première est devant ;
 * - placement des cartes fourni par `layout(rang)` (ici : celui de la maquette, deux cartes penchées).
 * On tire la carte de devant (souris ou doigt) : au-delà de 50 px, elle passe derrière la pile.
 */
import { motion, type PanInfo } from "framer-motion";
import { useRef, useState } from "react";

export type StackPose = { x: string | number; y: string | number; rotate: number; opacity: number };

type Props = {
  images: string[];
  order: number[]; // indices des images, du devant vers le fond
  onNext: () => void; // la carte de devant passe derrière
  layout: (rank: number) => StackPose;
  className?: string;
  cardClassName?: string;
  minDrag?: number;
};

export default function ImgStack({ images, order, onNext, layout, className, cardClassName, minDrag = 50 }: Props) {
  const [busy, setBusy] = useState(false);
  const start = useRef({ x: 0, y: 0 });

  const onDragStart = (_: unknown, info: PanInfo) => {
    start.current = { x: info.point.x, y: info.point.y };
  };
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (busy) return;
    const d = Math.hypot(info.point.x - start.current.x, info.point.y - start.current.y);
    if (d < minDrag) return; // pas assez loin : la carte revient seule
    setBusy(true);
    onNext();
    setTimeout(() => setBusy(false), 300);
  };

  return (
    <div className={className}>
      {images.map((src, i) => {
        const rank = order.indexOf(i);
        const top = rank === 0;
        return (
          <motion.div
            key={src + i}
            className={cardClassName}
            style={{ zIndex: 50 - rank * 10 }}
            initial={false}
            animate={{ ...layout(rank), scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
            drag={top && !busy}
            dragElastic={0.2}
            dragConstraints={{ left: -150, right: 150, top: -150, bottom: 150 }}
            dragSnapToOrigin
            dragTransition={{ bounceStiffness: 600, bounceDamping: 18 }}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            whileHover={top ? { scale: 1.04, transition: { duration: 0.2 } } : undefined}
            whileDrag={{ scale: 1.08, rotate: 0, zIndex: 100, transition: { duration: 0.12 } }}
            aria-hidden={!top}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" draggable={false} />
          </motion.div>
        );
      })}
    </div>
  );
}
