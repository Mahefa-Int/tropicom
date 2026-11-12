"use client";

/**
 * Image Stack Carousel (21st.dev, « SwipeCards »), adapté au site :
 * - pas de Tailwind dans le projet → styles en ligne ;
 * - chaque carte peut afficher une image (`img`) ou n'importe quel contenu (`content`) ;
 * - <img> simple (les images sont dans /public, pas besoin de next/image).
 * La carte de devant se tire à la souris / au doigt avec une inclinaison 3D ;
 * tirée assez loin, elle repasse sous la pile.
 */
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import React, { useState } from "react";

const defaultCards: SwipeCardItem[] = [
  { id: 1, img: "/images/cas/grand-hotel-diego.jpg" },
  { id: 2, img: "/images/cas/echoes-of-the-forest.jpg" },
  { id: 3, img: "/images/cas/calumma-travel-madagascar.jpg" },
];

// Réglages de la pile (valeurs d'origine du composant)
const defaultSettings = {
  width: 320, // largeur d'une carte (px)
  height: 320, // hauteur d'une carte (px)
  radius: 16, // arrondi des coins (px)
  swipeThreshold: 120, // distance à tirer pour que la carte parte sous la pile
  stackRotation: 5, // inclinaison (°) de chaque carte derrière celle de devant
  stackScale: 0.035, // réduction de chaque carte derrière celle de devant
  tiltStrength: 25, // inclinaison 3D pendant qu'on tire
  springStiffness: 300,
  springDamping: 30,
  mobileBreakpoint: 480,
  mobileScale: 0.8,
  /** point d'appui des cartes du dessous (d'où elles pivotent) */
  stackOrigin: "85% 85%",
  /** fond d'une carte (sous l'image ou le contenu) */
  background: "#171717",
};

export type SwipeCardsSettings = typeof defaultSettings;

export interface SwipeCardItem {
  id: number | string;
  img?: string;
  alt?: string;
  /** contenu libre de la carte (remplace l'image) */
  content?: React.ReactNode;
}

interface SwipeCardProps {
  children: React.ReactNode;
  isFront: boolean;
  zIndex: number;
  onSendToBack: () => void;
  settings: SwipeCardsSettings;
}

function SwipeCard({ children, isFront, zIndex, onSendToBack, settings }: SwipeCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // la distance tirée devient une inclinaison 3D
  const rotateX = useTransform(y, [-200, 200], [settings.tiltStrength, -settings.tiltStrength]);
  const rotateY = useTransform(x, [-200, 200], [-settings.tiltStrength, settings.tiltStrength]);

  function handleDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    const draggedFarEnough =
      Math.abs(info.offset.x) > settings.swipeThreshold || Math.abs(info.offset.y) > settings.swipeThreshold;
    if (draggedFarEnough) onSendToBack();
    else {
      x.set(0);
      y.set(0);
    }
  }

  return (
    <motion.div
      style={{
        position: "absolute",
        cursor: isFront ? "grab" : "default",
        userSelect: "none",
        touchAction: isFront ? "none" : "auto",
        width: settings.width,
        height: settings.height,
        x: isFront ? x : 0,
        y: isFront ? y : 0,
        rotateX: isFront ? rotateX : 0,
        rotateY: isFront ? rotateY : 0,
        zIndex,
      }}
      drag={isFront}
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.5}
      onDragEnd={handleDragEnd}
      whileHover={isFront ? { scale: 1.03 } : {}}
      whileDrag={{ cursor: "grabbing" }}
      transition={{ type: "spring", stiffness: settings.springStiffness, damping: settings.springDamping }}
    >
      {children}
    </motion.div>
  );
}

interface SwipeCardsProps {
  cards?: SwipeCardItem[];
  settings?: Partial<SwipeCardsSettings>;
  className?: string;
  style?: React.CSSProperties;
}

// réduit la pile sur petit écran (1 côté serveur / avant le montage : pas de saut au premier affichage)
function useResponsiveScale(breakpoint: number, mobileScale: number) {
  const [scale, setScale] = useState(1);
  React.useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setScale(mq.matches ? mobileScale : 1);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint, mobileScale]);
  return scale;
}

export function SwipeCards({ cards = defaultCards, settings, className = "", style }: SwipeCardsProps) {
  const baseConfig = { ...defaultSettings, ...settings };
  const scale = useResponsiveScale(baseConfig.mobileBreakpoint, baseConfig.mobileScale);
  const config = {
    ...baseConfig,
    width: Math.round(baseConfig.width * scale),
    height: Math.round(baseConfig.height * scale),
  };
  const [cardList, setCardList] = useState(cards);

  // la carte de devant repasse sous la pile
  const moveToBack = (id: number | string) => {
    setCardList((prev) => {
      const updated = [...prev];
      const i = updated.findIndex((c) => c.id === id);
      if (i !== -1) updated.push(...updated.splice(i, 1));
      return updated;
    });
  };

  return (
    <div className={className} style={{ display: "flex", alignItems: "center", justifyContent: "center", userSelect: "none", ...style }}>
      <div style={{ position: "relative", width: config.width, height: config.height, perspective: 1200 }}>
        {cardList.map((card, index) => {
          const isFront = index === 0;
          return (
            <SwipeCard
              key={card.id}
              isFront={isFront}
              zIndex={cardList.length - index}
              settings={config}
              onSendToBack={() => moveToBack(card.id)}
            >
              <motion.div
                data-front={isFront ? "" : undefined}
                data-depth={index}
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  overflow: "hidden",
                  background: config.background,
                  borderRadius: config.radius,
                  boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.6)",
                }}
                animate={{
                  rotateZ: index * config.stackRotation,
                  scale: 1 - index * config.stackScale,
                  transformOrigin: config.stackOrigin,
                }}
                initial={false}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
              >
                {card.content ?? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={card.img}
                    alt={card.alt ?? ""}
                    draggable={false}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
                  />
                )}
              </motion.div>
            </SwipeCard>
          );
        })}
      </div>
    </div>
  );
}

export default SwipeCards;
