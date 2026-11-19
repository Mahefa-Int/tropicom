# Tropi'Com — documentation du projet

Site vitrine de l'agence Tropi'Com et son back-office (administration du contenu), dans une seule application Next.js.

- **Site public (front-office)** : les pages vues par les visiteurs, indexées par Google.
- **Back-office** : `/admin`, protégé par un compte administrateur, jamais indexé.

> Le back-office n'est pas encore relié au site : les pages publiques n'affichent pas encore les articles,
> réalisations ou messages de la base. Voir [Prochaines étapes](#prochaines-étapes).

---

## Sommaire

1. [Technologies](#technologies)
2. [Installation en local](#installation-en-local)
3. [Commandes](#commandes)
4. [Organisation des fichiers](#organisation-des-fichiers)
5. [Site public](#site-public)
6. [Back-office](#back-office)
7. [Base de données](#base-de-données)
8. [Images](#images)
9. [Sécurité](#sécurité)
10. [Mise en ligne chez PlanetHoster](#mise-en-ligne-chez-planethoster)
11. [Conventions](#conventions)
12. [Prochaines étapes](#prochaines-étapes)

---

## Technologies

| Rôle | Technologie |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Exécution | Node.js 24 (20.9 minimum) |
| Styles | CSS maison (`app/globals.css` pour le site, `app/admin/admin.css` pour l'admin), sans framework |
| Police | DM Sans (axe de taille optique), via `next/font` |
| Animations | CSS, JavaScript (requestAnimationFrame), framer-motion, GSAP ; WebGL pour certains effets au survol |
| Base de données | MariaDB / MySQL |
| Accès à la base | Drizzle ORM + mysql2 ; migrations avec drizzle-kit |
| Validation | Zod |
| Éditeur d'articles | Tiptap 3 |
| Traitement des images | sharp (conversion en webp) |
| Carte / globe | d3-geo, topojson-client, world-atlas |

> **Attention, Next.js 16** : certaines conventions ont changé par rapport aux versions précédentes
> (par exemple le « middleware » s'appelle désormais `proxy.ts`). Avant de modifier le code, lire la documentation
> fournie dans `node_modules/next/dist/docs/` (voir `AGENTS.md`).

---

## Installation en local

Prérequis : **Node.js 24**, **XAMPP** (ou tout serveur MariaDB/MySQL).

1. Installer les dépendances :
   ```bash
   npm install
   ```
2. Démarrer MySQL depuis le panneau XAMPP.
3. Créer la base et son utilisateur (une seule fois), par exemple dans phpMyAdmin ou en ligne de commande :
   ```sql
   CREATE DATABASE tropicom CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'tropicom'@'localhost' IDENTIFIED BY 'un-mot-de-passe';
   GRANT ALL PRIVILEGES ON tropicom.* TO 'tropicom'@'localhost';
   ```
4. Copier `.env.example` en `.env.local` et renseigner `DATABASE_URL`.
5. Créer les tables :
   ```bash
   npm run db:migrate
   ```
6. Créer le compte administrateur (le mot de passe provisoire s'affiche une seule fois) :
   ```bash
   npm run db:admin -- admin@tropicom-agency.com "Admin Tropi'Com"
   ```
7. Lancer le site :
   ```bash
   npm run dev
   ```
   Site : http://localhost:3000 — Back-office : http://localhost:3000/admin

---

## Commandes

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement (rechargement à chaud) |
| `npm run build` | Compilation pour la production |
| `npm run start` | Lance la version compilée |
| `npm run db:generate` | Crée une migration SQL après une modification de `lib/db/schema.ts` |
| `npm run db:migrate` | Applique les migrations à la base |
| `npm run db:admin -- email "Nom"` | Crée le compte admin, ou réinitialise son mot de passe s'il existe déjà |

---

## Organisation des fichiers

```
app/
  page.tsx                  Accueil
  agence/                   L'Agence : equipe/, notre-histoire/, carrieres/ (+ redirection /agence → /agence/equipe)
  expertises/               Page Expertises
  realisations/             Page Nos réalisations ; [slug]/ : page d'une étude de cas (contenu de l'admin)
  essai/                    Page de test (effets, menus) — non liée au menu, non indexée
  notre-histoire/, carrieres/  Anciennes adresses, redirigées vers /agence/…
  admin/                    Back-office (voir plus bas)
  media/[...path]/          Sert les images envoyées depuis l'admin
  layout.tsx, globals.css   Mise en page commune, polices, styles du site
components/                 Une section du site par fichier (Hero, Navbar, Footer, Expertises*, …)
components/admin/           Composants du back-office
components/ui/              Composants réutilisables (pile d'images, …)
lib/
  db/schema.ts              Tables de la base
  db/index.ts               Connexion à la base
  db/migrations/            Migrations SQL générées
  admin/                    Back-office : sessions, mots de passe, actions serveur, outils
  motion.ts, services.ts    Outils et données du site
proxy.ts                    Protection rapide de /admin (+ en-tête noindex)
scripts/create-admin.mjs    Création / réinitialisation du compte admin
public/images/              Images du site (webp de préférence)
sources-images/             Originaux des images — NON versionné
uploads/                    Images envoyées depuis l'admin — NON versionné
```

---

## Site public

| Adresse | Page |
|---|---|
| `/` | Accueil |
| `/agence/equipe` | L'équipe (ancienne page « L'Agence ») |
| `/agence/notre-histoire` | Notre histoire |
| `/agence/carrieres` | Carrières |
| `/expertises` | Expertises (ancres `#pole-01` à `#pole-05`, défilement animé) |
| `/realisations` | Nos réalisations |
| `/realisations/[adresse]` | Étude de cas (ex. `/realisations/grand-hotel-diego`), gérée dans l'admin ; brouillons visibles seulement par un administrateur connecté |

Le menu « L'Agence » n'a pas de page propre : il ouvre un sous-menu (L'équipe, Notre histoire, Carrières).

**Mise en page** : chaque section est placée d'après la maquette (largeur de référence 1440 px), avec une unité
proportionnelle à la largeur de l'écran (`--g: calc(100vw / 1440)`). Sous 900 px, les sections passent en colonne.

**Fonds** : les dégradés et halos de fond sont faits en CSS et animés en JavaScript (composant `GlowField`), jamais avec des images.

**Animations** : elles respectent le réglage « réduire les animations » du système (`lib/motion.ts`).

**Avis Google** (accueil, « Nos clients en parlent ») : `components/TestimonialsSection.tsx` lit les avis de la fiche
Google via l'API Places (New) (`lib/googleReviews.ts`), garde ceux de **4 étoiles et plus** et les relit une fois
par jour. Variables : `GOOGLE_PLACES_API_KEY` et `GOOGLE_PLACE_ID`. Limite de Google : 5 avis au plus (les plus
pertinents). Sans clé ou en cas d'erreur, les avis de secours (`FALLBACK_REVIEWS` dans `Testimonials.tsx`) s'affichent.

---

## Back-office

Adresse : `/admin` (connexion : `/admin/connexion`). Un seul compte : l'administrateur.

| Page | Contenu |
|---|---|
| Tableau de bord | Chiffres clés, clics Google, derniers messages, articles récents |
| Statistiques | Données Google Search Console (clics, impressions, taux de clic, position) sur 7, 28 ou 90 jours |
| Articles | Blog : éditeur riche, image de couverture, catégorie (avec création rapide), adresse, brouillon / publié, titre et description pour Google ; filtres par statut et par catégorie |
| Catégories | Depuis Articles (bouton « Catégories ») : ajout, renommage, suppression (les articles restent, sans catégorie) ; catégories suggérées d'un clic |
| Réalisations | Toute la page d'une étude de cas : titre, tableau d'infos, photo (légende, chiffre clé), Contexte, L'enjeu, Notre réponse et ses leviers, visuels, Résultats (chiffres, bandeau), Verbatim, choix du « Projet suivant » (sa carte reprend la photo, le chiffre clé, le titre et les expertises de la réalisation visée), référencement. Une section laissée vide est masquée. Le bloc « Un enjeu comparable ? » est identique partout (dans le code). Contenu détaillé rangé en JSON (colonne `details`, voir `lib/cases.ts`). `npm run db:seed-cas` ajoute les études de cas de départ |
| Messages | Demandes reçues par les formulaires du site (non lus, lecture, réponse par e-mail, suppression) |
| Médiathèque | Images envoyées depuis les formulaires, gardées telles quelles à l'envoi (HEIC, TIFF, SVG convertis directement). Bouton « Optimiser » : webp, 2560 px max, qualité 80, gain affiché ; renommage d'après le texte alternatif + « -tropicom » (ex. facade-de-l-hotel-tropicom.webp, numéroté si le nom existe déjà ; texte alternatif vide = nom inchangé) ; l'adresse est remplacée partout où l'image est utilisée (articles, réalisations). Grille d'images, détail au clic : texte alternatif, description, ouverture en grand, suppression. Chaque champ image et l'éditeur d'articles ont « Choisir dans la Médiathèque » pour réutiliser une image déjà envoyée. Réglages : `lib/admin/images.ts` |
| Mon compte | Nom, e-mail de connexion, mot de passe |

Fichiers principaux :

- `app/admin/(panel)/…` : les pages (le dossier `(panel)` n'apparaît pas dans l'adresse, il partage la barre latérale) ;
- `lib/admin/actions.ts` : toutes les actions (enregistrer, supprimer, se connecter…) ;
- `lib/admin/dal.ts` : vérification de la session (`requireUser`), utilisée par chaque page et chaque action ;
- `lib/admin/session.ts`, `lib/admin/password.ts` : sessions et mots de passe ;
- `app/admin/api/upload/route.ts` : envoi des images.

**Connexion** : la case « Se souvenir de moi » garde la session 30 jours ; sans elle, la session s'arrête à la
fermeture du navigateur (12 h au plus).

**Mot de passe** : un seul accès administrateur, défini à la livraison. Pour le changer : « Mon compte ».
En cas de perte : `npm run db:admin -- admin@tropicom-agency.com` (sur le serveur) génère un nouveau mot de passe provisoire.

---

## Base de données

Tables (définies dans `lib/db/schema.ts`) :

| Table | Rôle |
|---|---|
| `users` | Compte administrateur (mot de passe chiffré) |
| `sessions` | Sessions de connexion (empreinte du jeton, expiration) |
| `categories` | Catégories des articles (nom, adresse, ordre) |
| `posts` | Articles du blog (contenu HTML, catégorie via `category_id`) |
| `case_studies` | Études de cas (réalisations) |
| `messages` | Messages des formulaires du site |
| `media` | Images envoyées (nom, taille, dimensions, texte alternatif) |
| `gsc_daily` | Statistiques Search Console, une ligne par jour |

**Modifier la structure** : éditer `lib/db/schema.ts`, puis `npm run db:generate` (crée un fichier SQL dans
`lib/db/migrations/`, à versionner) et `npm run db:migrate` (l'applique). En production, lancer `npm run db:migrate`
après chaque mise à jour qui contient une nouvelle migration.

Toutes les dates sont enregistrées en **UTC**.

---

## Images

- **Images du site** : dans `public/images/<section>/`, converties en **webp** (1200 px de large maximum en général).
  Les originaux vont dans `sources-images/` (non versionné).
- **Images envoyées depuis l'admin** : enregistrées dans `UPLOAD_DIR` (`uploads/` par défaut) et servies par
  `/media/<fichier>.webp`. Elles ne vont pas dans `public/`, car Next.js ne sert pas les fichiers ajoutés à `public`
  après la compilation. **Penser à sauvegarder ce dossier** sur le serveur.

---

## Sécurité

- Mots de passe chiffrés avec **scrypt** (sel aléatoire).
- Sessions en base : le navigateur garde un jeton aléatoire dans un cookie `httpOnly` (inaccessible au JavaScript),
  la base n'en garde que l'empreinte SHA-256. Durée : 30 jours avec « Se souvenir de moi », sinon fin à la fermeture
  du navigateur (12 h au plus).
- Connexion limitée à 5 essais ratés, puis 15 minutes d'attente.
- Chaque page et chaque action de l'admin vérifie la session côté serveur (le `proxy.ts` n'est qu'un premier filtre).
- `/admin` n'est jamais indexé : en-tête `X-Robots-Tag: noindex, nofollow` et balise `robots`.
- Les envois n'acceptent que des images (15 Mo maximum), réencodées en webp.
- Les secrets (`DATABASE_URL`) ne sont jamais versionnés : `.env.local` est ignoré par Git.

---

## Mise en ligne chez PlanetHoster

Panneau **N0C** → **Langages → Node.js** → Créer :

| Champ | Valeur |
|---|---|
| Version | **24** |
| Répertoire d'application | dossier du projet sur le serveur |
| Domaine | `tropicom-agency.com` |
| Fichier de démarrage | à définir au déploiement (lancement de `next start`) |
| Mode | Production |

Puis :

1. Créer la base MySQL et son utilisateur (**Bases de données**), et renseigner `DATABASE_URL`, `UPLOAD_DIR`
   (et, pour les avis Google, `GOOGLE_PLACES_API_KEY` et `GOOGLE_PLACE_ID`) dans les variables d'environnement
   de l'application.
2. Envoyer le code (Git ou SSH), puis `npm install` et `npm run build`
   (si la mémoire du serveur est juste, compiler en local et n'envoyer que le résultat).
3. `npm run db:migrate` puis `npm run db:admin -- email "Nom"`.
4. Démarrer l'application.
5. Vérifier le certificat SSL (https) du domaine.

Plus tard : **Crons** pour la synchronisation quotidienne de Search Console, et la validation du domaine dans
Search Console (enregistrement TXT dans la zone DNS).

---

## Conventions

- **Fidélité aux maquettes** : les positions, tailles et couleurs sont relevées sur les maquettes (largeur 1440 px).
- **Textes** : en français ; commentaires du code en français.
- **Commits** : messages en français. Ne jamais versionner `sources-images/`, `uploads/`, `.env.local`,
  `case-stack-scroll.txt` ni les vidéos lourdes.
- **Couleurs de la charte** : noir `#000`, noir charbon `#171616`, jaune doré `#f7c227`, bleu ca `#3e9d9e`, rose magenta `#de0b7d`.

---

## Prochaines étapes

1. **Relier le site au back-office** : pages `/blog` et `/blog/[adresse]`, liste des réalisations (`/realisations`) depuis la base,
   formulaires (contact, diagnostic, rapport) enregistrés dans `messages`.
2. **Search Console** : compte de service Google, synchronisation quotidienne vers `gsc_daily`.
3. **Référencement** : `robots.txt` (autoriser le site, exclure `/admin/`) et `sitemap.xml`.
4. **Déploiement** chez PlanetHoster.
