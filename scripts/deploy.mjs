/**
 * Mise en ligne chez PlanetHoster : npm run deploy
 * Se connecte au serveur (hôte SSH « tropicom-prod », voir DOCUMENTATION.md) puis :
 * git pull → npm install → compilation (webpack, le serveur est trop ancien pour Turbopack) → redémarrage de l'application.
 * Les changements de base de données (nouvelles tables) restent à faire à part (phpMyAdmin ou npm run db:migrate).
 */
import { spawnSync } from "node:child_process";

const remote = [
  "set -e",
  "source ~/nodevenv/tropicom/24/bin/activate",
  "cd ~/tropicom",
  "echo '→ git pull' && git pull --ff-only",
  "echo '→ npm install' && npm install --include=dev --no-audit --no-fund --loglevel=error",
  "echo '→ compilation (quelques minutes)' && NODE_OPTIONS=--max-old-space-size=1536 npx next build --webpack > /tmp/tropicom-build.log 2>&1 || (tail -40 /tmp/tropicom-build.log; exit 1)",
  "echo '→ redémarrage' && cloudlinux-selector restart --json --interpreter nodejs --app-root tropicom",
  "echo '✓ en ligne :' $(git log -1 --oneline)",
].join(" && ");

const r = spawnSync("ssh", ["-o", "BatchMode=yes", "tropicom-prod", remote], { stdio: "inherit" });
process.exit(r.status ?? 1);
