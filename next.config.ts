import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    /**
     * Styles intégrés dans la page (balise <style>) au lieu d'un fichier CSS séparé :
     * supprime une requête qui bloque l'affichage (gain net sur mobile et avec un serveur lointain).
     */
    inlineCss: true,
  },
};

export default nextConfig;
