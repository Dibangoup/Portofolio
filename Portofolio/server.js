require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Identifiants admin lus depuis .env (jamais commité, voir .env.example).
// Sans DASHBOARD_PASSWORD défini, le dashboard et la sauvegarde restent bloqués
// plutôt que de tomber sur un mot de passe par défaut prévisible.
const DASHBOARD_USER = process.env.DASHBOARD_USER || 'admin';
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || '';

if (!DASHBOARD_PASSWORD) {
  console.warn(
    '\n⚠️  DASHBOARD_PASSWORD non défini : /dashboard.html et /api/save resteront ' +
    'inaccessibles (503) tant que .env n\'est pas configuré. Copiez .env.example en .env ' +
    'et définissez un mot de passe.\n'
  );
}

// Comparaison à temps constant : on hash les deux valeurs avant de les comparer
// pour éviter que crypto.timingSafeEqual() ne lève une erreur en cas de longueurs
// différentes, tout en gardant une comparaison insensible au temps d'exécution.
function safeEqual(a, b) {
  const hashA = crypto.createHash('sha256').update(String(a)).digest();
  const hashB = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function requireDashboardAuth(req, res, next) {
  if (!DASHBOARD_PASSWORD) {
    return res
      .status(503)
      .send("Dashboard non configuré : définissez DASHBOARD_PASSWORD dans .env (voir .env.example), puis redémarrez le serveur.");
  }

  const authHeader = req.headers.authorization || '';
  const [scheme, encoded] = authHeader.split(' ');

  if (scheme === 'Basic' && encoded) {
    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    const sepIndex = decoded.indexOf(':');
    const user = sepIndex === -1 ? decoded : decoded.slice(0, sepIndex);
    const pass = sepIndex === -1 ? '' : decoded.slice(sepIndex + 1);

    if (safeEqual(user, DASHBOARD_USER) && safeEqual(pass, DASHBOARD_PASSWORD)) {
      return next();
    }
  }

  res.set('WWW-Authenticate', 'Basic realm="Dashboard Admin"');
  return res.status(401).send('Authentification requise pour accéder au dashboard.');
}

// Middleware pour parser le JSON
app.use(express.json({ limit: '10mb' }));

// Désactive le cache HTTP pour toujours servir la dernière version des fichiers
// (évite qu'un navigateur affiche une ancienne copie de js/portfolio-data.js
// après une sauvegarde depuis le dashboard)
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// Normalise les slashs multiples ("//dashboard.html") AVANT le routage : sans ça,
// app.get('/dashboard.html', ...) ne matche pas ce chemin, mais express.static()
// le résout quand même vers le même fichier sur le disque - un contournement pur
// et simple de l'authentification. On bloque donc ce contournement ici, en amont
// de toute route et du middleware static.
app.use((req, res, next) => {
  req.url = req.url.replace(/\/{2,}/g, '/');
  next();
});

// Le dashboard et la sauvegarde sont protégés par mot de passe (HTTP Basic Auth),
// enregistrés AVANT express.static pour que ce dernier ne puisse jamais servir
// dashboard.html directement sans passer par la vérification d'identifiants.
app.get('/dashboard.html', requireDashboardAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Endpoint pour sauvegarder les données du portfolio sur le disque
app.post('/api/save', requireDashboardAuth, (req, res) => {
  const portfolioData = req.body;
  if (!portfolioData) {
    return res.status(400).json({ error: 'Données manquantes' });
  }

  // Formatage en fichier JavaScript
  const fileContent = `// BASE DE DONNÉES DU PORTFOLIO - CENTRALISÉE ET MODIFIABLE EN TEMPS RÉEL
const DEFAULT_PORTFOLIO_DATA = ${JSON.stringify(portfolioData, null, 2)};

// Variable globale pour stocker les données chargées en mémoire
var PORTFOLIO_DATA = DEFAULT_PORTFOLIO_DATA;
`;

  const targetPath = path.join(__dirname, 'js', 'portfolio-data.js');

  fs.writeFile(targetPath, fileContent, 'utf8', (err) => {
    if (err) {
      console.error("Erreur lors de l'écriture du fichier:", err);
      return res.status(500).json({ error: "Impossible d'écrire sur le disque" });
    }
    console.log("Fichier js/portfolio-data.js mis à jour avec succès via le serveur de dev !");
    res.json({ success: true });
  });
});

// Empêche express.static de servir des fichiers internes au projet (code serveur,
// dépendances, documentation de planification) qui ne sont jamais destinés à être publics.
// .env lui-même est déjà bloqué par le comportement par défaut d'express.static pour les
// fichiers pointés (dotfiles) — ce middleware couvre les fichiers non pointés.
const BLOCKED_STATIC_PREFIXES = ['/server.js', '/package.json', '/package-lock.json', '/node_modules/', '/docs/', '/.superpowers/'];
app.use((req, res, next) => {
    const lowerPath = req.path.toLowerCase();
    if (BLOCKED_STATIC_PREFIXES.some(p => lowerPath === p || lowerPath.startsWith(p))) {
        return res.status(404).send('Not found');
    }
    next();
});

// Servir les fichiers statiques du site (portfolio public + reste des assets du dashboard)
app.use(express.static(__dirname));

// Endpoint pour vérifier si le serveur est en ligne (public, rien de sensible)
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok' });
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`\n=============================================================`);
  console.log(`🚀 SERVEUR DE DEV LOCAL ACTIF`);
  console.log(`👉 Portfolio  : http://localhost:${PORT}`);
  console.log(`👉 Dashboard  : http://localhost:${PORT}/dashboard.html (protégé par mot de passe)`);
  console.log(`=============================================================\n`);
});
