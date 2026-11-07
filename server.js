require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { execFile } = require('child_process');

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
const ALLOWED_TOP_LEVEL_KEYS = ['hero', 'about', 'skills', 'timeline', 'projects', 'cv', 'contact'];

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
// (~1300 lignes) et des attributs on*, donc reste permissif pour script/style inline (ses
// polices sont auto-hébergées) — il est déjà protégé par l'authentification HTTP Basic.
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
    styleSrc: ["'self'", "'unsafe-inline'"],
    fontSrc: ["'self'"],
    // 'https:' pour les mêmes raisons que strictCsp (voir son commentaire ci-dessus) :
    // le dashboard affiche lui-même ces images (aperçu live, éditeur de projets).
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'"],
    frameAncestors: ["'none'"],
  },
});

// En-têtes non liés au CSP (X-Content-Type-Options, X-Frame-Options, HSTS, etc.) partout ;
// le CSP lui-même est géré séparément ci-dessous pour pouvoir varier par route.
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
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

// ---------------------------------------------------------------------------
// CV en PDF + publication GitHub (utilisées par /api/save et /api/cv)
// ---------------------------------------------------------------------------
const ROOT_DIR = __dirname;
const DATA_PATH = path.join(ROOT_DIR, 'public', 'js', 'portfolio-data.js');
const DATA_FILE_REL = 'public/js/portfolio-data.js';
const CV_DIR = path.join(ROOT_DIR, 'public', 'cv');
const CV_DIR_REL = 'public/cv';
const CV_NAME_RE = /^cv-[a-f0-9]{16}\.pdf$/;
const CV_URL_RE = /^\/cv\/(cv-[a-f0-9]{16}\.pdf)$/;
const CV_MAX_BYTES = 5 * 1024 * 1024;

// Vérifie l'en-tête réel du fichier (pas seulement le Content-Type envoyé par le navigateur).
function isPdfBuffer(buf) {
  return Buffer.isBuffer(buf) && buf.length >= 5 && buf.subarray(0, 5).toString('latin1') === '%PDF-';
}

// Git est appelé sans shell (execFile + tableau d'arguments) : aucun texte venant du
// dashboard n'est interprété par un shell.
function runGit(args) {
  return new Promise((resolve, reject) => {
    const options = {
      cwd: ROOT_DIR,
      windowsHide: true,
      maxBuffer: 1024 * 1024,
      // Une demande d'identifiants invisible ou un réseau bloqué ne doit pas geler la file Git
      // (et donc toutes les sauvegardes suivantes) : échec au bout d'une minute, sans invite.
      timeout: 60000,
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never' },
    };
    execFile('git', args, options, (err, stdout, stderr) => {
      if (err) {
        err.stderr = stderr;
        return reject(err);
      }
      resolve(String(stdout).trim());
    });
  });
}

// Une seule opération Git à la fois : deux sauvegardes simultanées se disputeraient l'index.
let gitQueue = Promise.resolve();
function queueGit(task) {
  const run = gitQueue.then(task);
  gitQueue = run.catch(() => {});
  return run;
}

// La première ligne d'un push refusé est « To https://github.com/... » : on cherche la vraie raison.
function gitErrorLine(text) {
  const lines = String(text || '').split('\n').map((l) => l.trim()).filter(Boolean);
  return lines.find((l) => /rejected|fatal|error|denied/i.test(l)) || lines[0] || 'erreur inconnue';
}

// Commit + push des seuls chemins listés. Ne publie que si GIT_AUTO_PUBLISH=true, sur main,
// et si rien d'autre n'est déjà préparé dans l'index.
async function publishToGit(relPaths, message, git = runGit) {
  if (process.env.GIT_AUTO_PUBLISH !== 'true') {
    return { published: false, reason: 'Publication GitHub désactivée (GIT_AUTO_PUBLISH non défini sur true dans .env).' };
  }

  const tracked = await git(['ls-files', '--', ...relPaths]);
  const targets = relPaths.filter((p) =>
    fs.existsSync(path.join(ROOT_DIR, p)) ||
    tracked.split('\n').some((f) => f === p || f.startsWith(p + '/'))
  );
  if (targets.length === 0) return { published: false, reason: 'Rien à publier.' };

  const branch = await git(['rev-parse', '--abbrev-ref', 'HEAD']);
  if (branch !== 'main') {
    return { published: false, reason: `Branche courante « ${branch} » : la publication se fait uniquement depuis main.` };
  }

  const alreadyStaged = await git(['diff', '--cached', '--name-only']);
  if (alreadyStaged) {
    return { published: false, reason: 'Des fichiers sont déjà préparés dans Git : publication annulée pour ne pas les inclure.' };
  }

  // `git push origin main` enverrait aussi tout commit local pas encore poussé : on refuse
  // plutôt que de publier à l'insu du propriétaire un travail sans rapport avec le dashboard.
  const unpushed = await git(['rev-list', '--count', 'origin/main..HEAD']);
  if (unpushed !== '0') {
    return {
      published: false,
      reason: `${unpushed} commit(s) local(aux) pas encore poussé(s) sur main : publication annulée pour ne pas les publier à votre insu. Dans un terminal : « git pull --rebase --autostash » puis « git push », puis enregistrez à nouveau.`,
    };
  }

  await git(['add', '-A', '--', ...targets]);
  const changed = await git(['diff', '--cached', '--name-only']);
  if (!changed) return { published: true, changed: false };

  try {
    await git(['commit', '-m', message]);
  } catch (err) {
    // Sans ce retour en arrière, les fichiers resteraient préparés : chaque sauvegarde suivante
    // serait refusée, et le prochain commit manuel les embarquerait sans prévenir.
    await git(['reset', '-q', '--', ...targets]).catch(() => {});
    console.error('Commit échoué :', gitErrorLine(err.stderr));
    return { published: false, reason: `Commit impossible : ${gitErrorLine(err.stderr)}` };
  }

  try {
    await git(['push', 'origin', 'main']);
  } catch (err) {
    console.error('Push GitHub échoué :', gitErrorLine(err.stderr));
    return {
      published: false,
      committed: true,
      reason: `Commit créé en local, mais le push vers GitHub a échoué : ${gitErrorLine(err.stderr)}`,
    };
  }
  return { published: true, changed: true };
}

// Supprime les anciens PDF du CV : un seul CV est conservé, celui référencé par les données.
async function removeOrphanCvFiles(keepName) {
  let entries = [];
  try {
    entries = await fs.promises.readdir(CV_DIR);
  } catch (err) {
    return; // pas de dossier : rien à nettoyer
  }
  await Promise.all(
    entries
      .filter((f) => CV_NAME_RE.test(f) && f !== keepName)
      .map((f) => fs.promises.unlink(path.join(CV_DIR, f)))
  );
}

// Envoi du PDF : corps brut limité, type application/pdf uniquement, en-tête %PDF- vérifié,
// nom aléatoire. Le fichier n'est référencé par les données qu'à la sauvegarde suivante.
const rawPdfParser = express.raw({ type: 'application/pdf', limit: CV_MAX_BYTES });
app.post(
  '/api/cv',
  authLimiter,
  requireDashboardAuth,
  requireCustomHeader,
  (req, res, next) => {
    rawPdfParser(req, res, (err) => {
      if (err) {
        if (err.status === 413) return res.status(413).json({ error: 'Fichier trop lourd (5 Mo maximum).' });
        return res.status(400).json({ error: 'Requête invalide.' });
      }
      next();
    });
  },
  async (req, res) => {
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      return res.status(415).json({ error: 'Envoyez un fichier PDF.' });
    }
    if (!isPdfBuffer(req.body)) {
      return res.status(400).json({ error: "Ce fichier n'est pas un PDF valide." });
    }
    const name = `cv-${crypto.randomBytes(8).toString('hex')}.pdf`;
    try {
      await fs.promises.mkdir(CV_DIR, { recursive: true });
      await fs.promises.writeFile(path.join(CV_DIR, name), req.body, { flag: 'wx' });
    } catch (err) {
      console.error("Erreur lors de l'enregistrement du CV :", err);
      return res.status(500).json({ error: "Impossible d'enregistrer le fichier" });
    }
    res.json({ url: `/cv/${name}` });
  }
);

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

  const cvUrl = cleanData.cv?.pdfUrl ?? '';
  // typeof : RegExp.test convertit un tableau en texte, ["/cv/cv-….pdf"] passerait sinon.
  if (cvUrl !== '' && (typeof cvUrl !== 'string' || !CV_URL_RE.test(cvUrl))) {
    return res.status(400).json({ error: 'Lien PDF invalide.' });
  }
  // Un onglet resté ouvert avec d'anciennes données, ou une version restaurée, peut référencer
  // un PDF déjà remplacé : l'accepter publierait un lien cassé et supprimerait le CV actuel.
  if (cvUrl && !fs.existsSync(path.join(CV_DIR, cvUrl.slice('/cv/'.length)))) {
    return res.status(409).json({ error: "Le PDF du CV référencé n'existe plus : rechargez le dashboard ou renvoyez le PDF depuis l'onglet CV." });
  }

  // Formatage en fichier JavaScript
  const fileContent = `// BASE DE DONNÉES DU PORTFOLIO - CENTRALISÉE ET MODIFIABLE EN TEMPS RÉEL
const DEFAULT_PORTFOLIO_DATA = ${JSON.stringify(cleanData, null, 2)};

// Variable globale pour stocker les données chargées en mémoire
var PORTFOLIO_DATA = DEFAULT_PORTFOLIO_DATA;
`;

  queueGit(async () => {
    await fs.promises.writeFile(DATA_PATH, fileContent, 'utf8');
    // Nettoyage seulement quand un PDF est référencé : des données sans lien (onglet ouvert
    // avant l'envoi du CV, par exemple) ne doivent jamais supprimer le CV en place.
    if (cvUrl) await removeOrphanCvFiles(cvUrl.slice('/cv/'.length));
    let publication;
    try {
      publication = await publishToGit([DATA_FILE_REL, CV_DIR_REL], 'chore(dashboard): mise à jour du portfolio');
    } catch (err) {
      console.error('Publication Git inattendue :', err);
      publication = { published: false, reason: 'Erreur Git inattendue (voir le terminal).' };
    }
    console.log('Fichier js/portfolio-data.js mis à jour via le serveur de dev.');
    return publication;
  })
    .then((publication) => res.json({ success: true, ...publication }))
    .catch((err) => {
      console.error("Erreur lors de l'écriture du fichier:", err);
      res.status(500).json({ error: "Impossible d'écrire sur le disque" });
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

// Lancement du serveur (pas lancé quand le fichier est importé par les tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n=============================================================`);
    console.log(`🚀 SERVEUR DE DEV LOCAL ACTIF`);
    console.log(`👉 Portfolio  : http://localhost:${PORT}`);
    console.log(`👉 Dashboard  : http://localhost:${PORT}/dashboard.html (protégé par mot de passe)`);
    console.log(`=============================================================\n`);
  });
}

module.exports = { app, isPdfBuffer, publishToGit, CV_MAX_BYTES };



