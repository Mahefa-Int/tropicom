# Tropi'Com — site vitrine (Next.js)

## Lancer le site en local

```bash
npm install      # première fois seulement
npm run dev      # http://localhost:3000
```

## Mettre en ligne

```bash
npm run build
npm run start
```

## Organisation

- `app/` : page (`page.tsx`), mise en page et polices (`layout.tsx`), styles (`globals.css`)
- `components/` : une section par fichier (Navbar, Hero, Intro, Trust, Services, Footer)
- `lib/services.ts` : textes, images et tags des 5 expertises
- `public/images/` : toutes les images
- `_static/` : ancienne version HTML/CSS (référence uniquement)
