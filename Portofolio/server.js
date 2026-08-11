require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

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

// Un navigateur réattache automatiquement les identifiants Basic Auth mis en cache à
// toute requête vers la même origine, même déclenchée par une page tierce (CSRF). Ce
// header personnalisé ne peut pas être posé par un <form> ou un lien cross-site ; seul
// du JavaScript same-origin le peut, sans déclencher de blocage CORS puisqu'aucune
// configuration CORS n'autorise ce header en cross-origin.
function requireCustomHeader(req, res, next) {
  if (req.get('X-Dashboard-Request') !== '1') {
    return res.status(403).json({ error: 'Requête refusée (en-tête manquant).' });
  }
  next();
}

// Comparaison à temps constant : on hash les deux valeurs avant de les comparer
// pour éviter que crypto.timingSafeEqual() ne lève une erreur en cas de longueurs
// différentes, tout en gardant une comparaison insensible au temps d'exécution.
function safeEqual(a, b) {
  const hashA = crypto.createHash('sha256').update(String(a)).digest();
  const hashB = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

// Le fichier généré par /api/save est chargé par le navigateur comme du VRAI JavaScript
// (const DEFAULT_PORTFOLIO_DATA = {...};), pas via JSON.parse — une clé "__proto__" dans
// le payload aurait donc un effet réel sur le prototype de l'objet une fois interprétée
// par le navigateur. On la retire par précaution, à tous les niveaux d'imbrication.
const DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype'];
function stripDangerousKeys(value) {
  if (Array.isArray(value)) return value.map(stripDangerousKeys);
  if (value && typeof value === 'object') {
    const clean = {};
    for (const key of Object.keys(value)) {
      if (DANGEROUS_KEYS.includes(key)) continue;
      clean[key] = stripDangerousKeys(value[key]);
    }
    return clean;
  }
  return value;
}

// Les seules clés de premier niveau que js/portfolio-data.js est censé contenir.
const ALLOWED_TOP_LEVEL_KEYS = ['hero', 'about', 'skills', 'projects', 'cv', 'contact'];

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
// Limite les tentatives d'authentification pour rendre le brute-force du mot de passe
// du dashboard impraticable, sans gêner un usage légitime (un seul admin).
// skipSuccessfulRequests: seules les requêtes échouées (mauvais mot de passe, requête
// rejetée) comptent dans le quota — une session d'édition normale (rechargements +
// sauvegardes répétées, toutes réussies) ne doit jamais épuiser le quota et bloquer
// l'unique admin légitime hors de son propre dashboard.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: 'Trop de tentatives, réessayez plus tard.',
});

// Deux Content-Security-Policy distinctes : le site public n'a aucun script/style inline
// et peut donc être strict (défense réelle contre une XSS qui passerait malgré tout à
// travers l'échappement) ; le dashboard a un unique <script> inline de tout son code
// (~1300 lignes) et charge des polices Google Fonts, donc reste permissif pour continuer
// à fonctionner — il est déjà protégé par l'authentification HTTP Basic.
const strictCsp = helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'"],
    fontSrc: ["'self'"],
    // 'https:' (pas une allowlist d'hôtes précis) car le dashboard permet de définir une
    // image de projet/portrait par URL externe (pas seulement par upload) — voir son champ
    // "Lien URL". Toujours plus strict que l'absence de CSP : bloque tout schéma non-https
    // (javascript:, etc.), juste pas restreint à un hébergeur d'images précis.
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'", 'https://api.web3forms.com'],
    formAction: ["'self'", 'https://api.web3forms.com'],
    frameAncestors: ["'none'"],
  },
});

const dashboardCsp = helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    // helmet applique par défaut script-src-attr 'none' si non précisé, ce qui bloquerait
    // les ~78 attributs on* (onclick, onchange, oninput...) utilisés dans tout le dashboard
    // pour ses interactions (édition de champs, aperçu live des images, etc.).
    scriptSrcAttr: ["'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    // 'https:' pour les mêmes raisons que strictCsp (voir son commentaire ci-dessus) :
    // le dashboard affiche lui-même ces images (aperçu live, éditeur de projets).
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'"],
    frameAncestors: ["'none'"],
  },
});

// En-têtes non liés au CSP (X-Content-Type-Options, X-Frame-Options, etc.) partout ;
// le CSP lui-même est géré séparément ci-dessous pour pouvoir varier par route.
app.use(helmet({ contentSecurityPolicy: false }));
// Politique stricte par défaut sur toutes les routes ; la route /dashboard.html (définie
// plus bas) applique dashboardCsp après ce middleware, ce qui REMPLACE l'en-tête déjà posé
// (les en-têtes HTTP ne sont envoyés qu'à l'appel de res.sendFile()/res.send(), donc c'est
// la dernière valeur posée avant l'envoi qui compte — pas besoin de middleware conditionnel).
app.use(strictCsp);

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
app.get('/dashboard.html', authLimiter, requireDashboardAuth, dashboardCsp, (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Endpoint pour sauvegarder les données du portfolio sur le disque
app.post('/api/save', authLimiter, requireDashboardAuth, requireCustomHeader, (req, res) => {
  const portfolioData = req.body;
  if (!portfolioData) {
    return res.status(400).json({ error: 'Données manquantes' });
  }

  const unexpectedKeys = Object.keys(portfolioData).filter(k => !ALLOWED_TOP_LEVEL_KEYS.includes(k));
  if (unexpectedKeys.length > 0) {
    return res.status(400).json({ error: `Clés inattendues : ${unexpectedKeys.join(', ')}` });
  }
  const cleanData = stripDangerousKeys(portfolioData);

  // Formatage en fichier JavaScript
  const fileContent = `// BASE DE DONNÉES DU PORTFOLIO - CENTRALISÉE ET MODIFIABLE EN TEMPS RÉEL
const DEFAULT_PORTFOLIO_DATA = ${JSON.stringify(cleanData, null, 2)};

// Variable globale pour stocker les données chargées en mémoire
var PORTFOLIO_DATA = DEFAULT_PORTFOLIO_DATA;
`;

  const targetPath = path.join(__dirname, 'public', 'js', 'portfolio-data.js');

  fs.writeFile(targetPath, fileContent, 'utf8', (err) => {
    if (err) {
      console.error("Erreur lors de l'écriture du fichier:", err);
      return res.status(500).json({ error: "Impossible d'écrire sur le disque" });
    }
    console.log("Fichier js/portfolio-data.js mis à jour avec succès via le serveur de dev !");
    res.json({ success: true });
  });
});

// Servir les fichiers statiques du site — UNIQUEMENT depuis public/, qui ne contient que
// les fichiers réellement destinés à être publics (index.html, css/, js/, images/).
// dashboard.html, server.js, package.json, node_modules/, docs/, etc. sont physiquement
// absents de cette racine : aucune technique de contournement (encodage, alias Windows,
// segments ./ ou ../) ne peut donc jamais les atteindre via ce middleware, quel que soit
// le chemin demandé — la protection vient de la structure du système de fichiers, pas
// d'une liste de blocage à maintenir.
app.use(express.static(path.join(__dirname, 'public')));

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



