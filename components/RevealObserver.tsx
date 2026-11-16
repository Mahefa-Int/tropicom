"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/** Apparition des sections au scroll : ajoute .in-view aux éléments [data-reveal]. */
export default function RevealObserver() {
  useEffect(() => {
    // règles CSS « animations réduites » (seulement si lib/motion.ts le demande)
    if (prefersReducedMotion()) document.documentElement.dataset.reduceMotion = "";
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
