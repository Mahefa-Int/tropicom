/**
 * Fichier de démarrage pour PlanetHoster (N0C → Langages → Node.js → « Fichier de démarrage » : server.js).
 * Lance la version compilée du site (équivalent de `next start`) sur le port donné par l'hébergeur.
 * Avant : `npm run build`. En local, utiliser `npm run dev` ou `npm run start`.
 */
const { createServer } = require("node:http");
const next = require("next");

const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`> Tropi'Com en ligne sur le port ${port}`);
  });
});
