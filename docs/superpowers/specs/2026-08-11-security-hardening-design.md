# Sécurisation Portofolio (spec)

## Contexte

Un audit de sécurité manuel du projet Portofolio (site public `index.html`/`js/app.js`, dashboard `dashboard.html`, serveur `server.js`) a identifié 8 constats, du plus au moins sévère :

1. XSS stockée systémique dans `js/app.js` (17 `innerHTML =` interpolant `PORTFOLIO_DATA` sans échappement).
2. `express.static(__dirname)` expose publiquement `server.js`, `package.json`, `node_modules/`, `docs/`.
3. Aucune validation de schéma sur `POST /api/save` (risque de pollution de prototype via une clé `__proto__`, puisque le fichier généré est chargé comme du JavaScript réel, pas via `JSON.parse`).
4. Aucune limitation de tentatives sur l'authentification du dashboard.
5. Risque CSRF via les identifiants HTTP Basic Auth mis en cache par le navigateur.
6. Aucun en-tête de sécurité HTTP (CSP, `X-Content-Type-Options`, `X-Frame-Options`, etc.).
7. `npm audit` : 1 vulnérabilité *high* (`nanoid`) + 1 *moderate* (`postcss`), toutes deux des dépendances de build transitives (chaîne Tailwind).
8. Le mot de passe réel du dashboard se trouve en clair dans `Portofolio/.claude/settings.local.json` (protégé par un gitignore global, jamais entré dans l'historique git).

L'utilisateur a validé : tout corriger en une seule passe (tâches 1-7 dans ce plan de code ; le point 8 est une action ponctuelle hors plan, traitée séparément après validation explicite).

## Portée

**Dans le périmètre :** les 7 premiers constats, chacun avec l'approche technique décidée ci-dessous.

**Hors périmètre (explicitement) :**
- Le point 8 (fichier de credentials qui traîne) — action de nettoyage manuelle, pas une tâche de code.
- Restructuration du projet en `public/` (aurait résolu le point 2 plus proprement, mais casserait des dizaines de chemins relatifs à travers tout le projet pour un gain marginal sur un outil de dev local — le middleware de blocage explicite est le choix retenu, moins invasif).
- Refactorisation du script inline de `dashboard.html` (~1300 lignes) en fichier externe — aurait permis un CSP strict aussi sur le dashboard, mais c'est un chantier de restructuration à part entière, pas une correction de sécurité ciblée. Le dashboard reste protégé par l'authentification HTTP Basic existante ; le CSP y est appliqué en mode permissif plutôt que retiré (voir §6).
- `js/portfolio-data.js` — son schéma ne change pas.
- Le mécanisme d'authentification lui-même (comparaison à temps constant déjà correcte) — non touché.
- Migration vers un vrai système de sessions/tokens pour remplacer HTTP Basic Auth — hors sujet, la mitigation CSRF ciblée (§5) suffit au périmètre actuel.
- Validation finale : une fois les correctifs en place, recommandé de lancer `penetration-testing-with-strix` (skill nouvellement disponible) pour prouver par l'exploitation que chaque finding est effectivement fermé — mentionné ici, pas exécuté dans ce plan (nécessite une décision utilisateur séparée, cf. le corps du message de l'skill `finishing-a-development-branch`).

## 1. XSS stockée dans `js/app.js`

### Principe

Deux patterns selon le site d'appel, plus une fonction d'échappement partagée à ajouter (miroir de celle qui existe déjà dans `dashboard.html`).

### Nouvelle fonction

Ajoutée près du haut de `js/app.js` (dans la portée du `DOMContentLoaded`, avant sa première utilisation) :

```js
const escapeHtml = (str) => String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));
```

### Pattern A — champs à valeur unique → `textContent`

- `renderHero()` : `titleEl.innerHTML = h.title` → `titleEl.textContent = h.title`. Le support du `<br>` dans le titre d'accroche est retiré (décision validée) — si l'utilisateur veut un saut de ligne visuel, ça devient un problème de CSS (`white-space`/largeur de conteneur), pas de HTML injecté.
- `renderHero()`, le logo nav : actuellement `logoEl.innerHTML = \`${h.name} Portfolio<span style="...">...\`` mélange texte dynamique et une pastille décorative statique. Remplacé par une structure fixe dans le HTML (`index.html`, un `<span id="nav-logo-name"></span>` suivi d'un `<span class="nav-logo-dot"></span>` déjà stylé en CSS) + `document.getElementById('nav-logo-name').textContent = \`${h.name} Portfolio\`` en JS. Ça retire aussi le seul `style="..."` inline injecté par JS sur le site public — utile pour le CSP strict du point 6.
- `renderAbout()` : `titleEl.textContent` déjà correct (pas de changement). `journey1`/`journey2` déjà en `textContent` (pas de changement).

### Pattern B — structures/listes générées → garder le templating, échapper chaque valeur

Pour `renderAbout()` (paragraphes, formations, valeurs), `renderSkills()`, `renderProjects()`, `openProjectModal()`, la modale CV : la structure HTML (balises, classes, répétition d'éléments) reste inchangée, mais **chaque** interpolation `${...}` qui vient de `PORTFOLIO_DATA`/`PROJECTS_DATA` est enveloppée dans `escapeHtml(...)`. Exemple représentatif (`renderProjects()`) :

```js
// Avant
<article class="stop-card" data-category="${proj.category}" data-project-id="${proj.id}">
  <img alt="${proj.cardTitle}" src="${proj.image}" />

// Après
<article class="stop-card" data-category="${escapeHtml(proj.category)}" data-project-id="${escapeHtml(proj.id)}">
  <img alt="${escapeHtml(proj.cardTitle)}" src="${escapeHtml(proj.image)}" />
```

Ce traitement s'applique systématiquement à toutes les valeurs de données interpolées dans `renderAbout()` (`p`, `e.dates`/`e.degree`/`e.school`/`e.desc`, `v.emoji`/`v.title`/`v.desc`), `renderSkills()` (`item.name`, `item.percent`, `cat.category`), `renderProjects()` (tous les champs de `proj`), `openProjectModal()` (`data.tech`, `data.features`, `data.image`, `data.title`, `data.categoryLabel`, `data.description`), et la modale CV (mêmes principes sur les champs de `PORTFOLIO_DATA.cv`). Les appels à `renderIcon(...)` ne sont PAS échappés — ce ne sont pas des données utilisateur, ce sont des noms d'icônes fixes issus du code (`js/icons.js`), déjà validés par le pattern `iconFor()` existant.

### Validation d'URL pour les liens externes

`data.demo`/`data.source` (modale projet) sont actuellement posés bruts en `href="${...}"`. L'échappement HTML seul ne bloque pas un schéma `javascript:`. Nouvelle fonction :

```js
const safeUrl = (url) => {
    if (!url || url === '#') return '#';
    try {
        const parsed = new URL(url, window.location.origin);
        return (parsed.protocol === 'http:' || parsed.protocol === 'https:') ? url : '#';
    } catch {
        return '#';
    }
};
```

Utilisée pour envelopper `data.demo`/`data.source` avant de les poser en `href`, et `h.image`/`data.image`/`proj.image` avant de les poser en `src` (même risque théorique, coût de protection nul).

## 2. Exposition de fichiers via `express.static`

Middleware ajouté dans `server.js`, **avant** `app.use(express.static(__dirname))` :

```js
const BLOCKED_STATIC_PREFIXES = ['/server.js', '/package.json', '/package-lock.json', '/node_modules/', '/docs/', '/.superpowers/'];
app.use((req, res, next) => {
    if (BLOCKED_STATIC_PREFIXES.some(p => req.path === p || req.path.startsWith(p))) {
        return res.status(404).send('Not found');
    }
    next();
});
```

Placé après le middleware de normalisation des slashs multiples existant (pour ne pas pouvoir être contourné par `//server.js`), avant les routes `/dashboard.html` et `/api/save` (qui ne sont de toute façon pas dans cette liste) et avant `express.static`.

## 3. Validation de schéma sur `POST /api/save`

Deux vérifications ajoutées dans le handler, avant l'écriture sur disque :

```js
const ALLOWED_TOP_LEVEL_KEYS = ['hero', 'about', 'skills', 'projects', 'cv', 'contact'];
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
```

Dans `app.post('/api/save', ...)`, avant le `JSON.stringify` actuel :

```js
const unexpectedKeys = Object.keys(portfolioData).filter(k => !ALLOWED_TOP_LEVEL_KEYS.includes(k));
if (unexpectedKeys.length > 0) {
    return res.status(400).json({ error: `Clés inattendues : ${unexpectedKeys.join(', ')}` });
}
const cleanData = stripDangerousKeys(portfolioData);
```

`cleanData` remplace `portfolioData` dans le `JSON.stringify` qui suit. `Object.keys()` (utilisé par `JSON.parse`, qu'`express.json()` appelle en interne) n'énumère jamais `__proto__` comme clé propre d'un objet créé par `JSON.parse` — le filtre `DANGEROUS_KEYS` est donc une défense en profondeur pour le cas où ce comportement changerait ou où `req.body` serait un jour construit autrement, pas une correction d'une faille déjà démontrée dans `express.json()` lui-même.

## 4. Limitation des tentatives d'authentification

Nouvelle dépendance : `express-rate-limit`.

```js
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 tentatives par fenêtre glissante
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Trop de tentatives, réessayez plus tard.',
});
```

Appliqué aux deux routes protégées, avant `requireDashboardAuth` :

```js
app.get('/dashboard.html', authLimiter, requireDashboardAuth, (req, res) => { ... });
app.post('/api/save', authLimiter, requireDashboardAuth, (req, res) => { ... });
```

20 tentatives/15 min est généreux pour un usage légitime (un seul admin qui tape parfois mal son mot de passe) tout en rendant un brute-force impraticable.

## 5. Mitigation CSRF sur `/api/save`

`requireDashboardAuth` protège déjà `/api/save` par mot de passe, mais un navigateur réattache automatiquement des identifiants Basic Auth en cache à une requête cross-site vers la même origine. Ajout d'une vérification d'en-tête personnalisé, qu'un `<form>` ou un lien cross-site ne peut pas poser (seul du JavaScript same-origin le peut, sans déclencher de blocage CORS puisqu'aucune configuration CORS n'autorise ce header en cross-origin) :

```js
function requireCustomHeader(req, res, next) {
    if (req.get('X-Dashboard-Request') !== '1') {
        return res.status(403).json({ error: 'Requête refusée (en-tête manquant).' });
    }
    next();
}
```

Appliqué uniquement à `/api/save` (pas à `/dashboard.html`, qui est un simple `GET` de page, pas une action) :

```js
app.post('/api/save', authLimiter, requireDashboardAuth, requireCustomHeader, (req, res) => { ... });
```

Côté client, `dashboard.html`'s save-related fetch call(s) (recherche de `fetch(` vers `/api/save`) gagnent l'en-tête `'X-Dashboard-Request': '1'` dans leurs options `headers`.

## 6. En-têtes de sécurité HTTP (`helmet`)

Nouvelle dépendance : `helmet`. Un seul CSP global casserait soit la protection du site public (`unsafe-inline` partout), soit le dashboard (son script inline de ~1300 lignes ne s'exécuterait plus). Deux politiques distinctes :

```js
const helmet = require('helmet');

const strictCsp = helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        fontSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'", 'https://api.web3forms.com'],
        formAction: ["'self'", 'https://api.web3forms.com'],
        frameAncestors: ["'none'"],
    },
});

const dashboardCsp = helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"],
    },
});

app.use(helmet({ contentSecurityPolicy: false })); // en-têtes non-CSP (X-Content-Type-Options, X-Frame-Options, etc.) partout
app.use(strictCsp); // politique stricte par défaut sur toutes les routes

// ... plus bas, dans la définition de la route dashboard existante :
app.get('/dashboard.html', authLimiter, requireDashboardAuth, dashboardCsp, (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});
```

Ordre voulu, sans ambiguïté : `strictCsp` est enregistré en premier via `app.use()`, donc il s'exécute pour **toutes** les requêtes, y compris `/dashboard.html`, et pose l'en-tête `Content-Security-Policy` strict. Pour une requête vers `/dashboard.html` spécifiquement, l'exécution continue ensuite dans la chaîne de middlewares de cette route, où `dashboardCsp` (placé après `requireDashboardAuth`, juste avant le handler) appelle à son tour `res.setHeader('Content-Security-Policy', ...)` — ce qui **remplace** la valeur posée par `strictCsp` (les en-têtes HTTP ne sont envoyés qu'à `res.sendFile()`/`res.send()`, donc c'est la dernière valeur posée avant l'envoi qui compte). Résultat : toutes les autres routes gardent le CSP strict, `/dashboard.html` reçoit le CSP permissif — sans middleware conditionnel ni vérification de chemin supplémentaire.

`index.html` n'a aujourd'hui aucun script ni style inline (vérifié) une fois le point 1 appliqué (retrait du seul `style="..."` inline du logo), et n'utilise aucune police via Google Fonts CDN (uniquement des `@font-face` auto-hébergées dans `css/style.css`, vérifié) — `scriptSrc`/`styleSrc`/`fontSrc` stricts, `'self'` uniquement, sont donc réalistes pour lui sans rien casser. Le dashboard, lui, charge bien des polices via `fonts.googleapis.com`/`fonts.gstatic.com` (Inter, Plus Jakarta Sans, Space Grotesk) — d'où la présence de ces domaines uniquement dans `dashboardCsp`.

## 7. `npm audit fix`

Exécuté directement, puis `npm run build:css` relancé pour confirmer que la chaîne Tailwind fonctionne toujours après la mise à jour de `nanoid`/`postcss` (dépendances de dev transitives, aucun code applicatif n'en dépend directement).

## Contrat à préserver

- `js/portfolio-data.js` : schéma inchangé.
- Aucun `id` existant renommé. Nouveau `id` : `nav-logo-name` (remplace le contenu texte actuellement généré dans `#nav-logo`, qui garde son `id` et devient un conteneur pour `#nav-logo-name` + `.nav-logo-dot`).
- Comportement fonctionnel identique pour un usage légitime : le dashboard continue de fonctionner normalement (juste avec un en-tête `X-Dashboard-Request` en plus sur sa requête de sauvegarde), le site public rend le même contenu (juste sans possibilité d'y injecter du HTML/JS).
- Aucun changement au mécanisme d'authentification lui-même.

## Vérification

- Pas de suite de tests automatisée sur ce projet — vérification manuelle/Playwright à chaque tâche, comme pour les plans précédents.
- Vérification spécifique pour le point 1 : tenter d'enregistrer une valeur contenant `<img src=x onerror=alert(1)>` dans un champ texte via le dashboard (sans cliquer "Enregistrer" pour de vrai — utiliser une donnée en mémoire ou un test DOM direct) et confirmer qu'elle s'affiche comme texte littéral sur le site public, pas comme balise active.
- Vérification pour le point 2 : confirmer que `/server.js`, `/package.json`, `/docs/...` renvoient bien 404 après le correctif (déjà testé manuellement à 200 avant correctif, pendant l'audit).
- Vérification pour le point 6 : confirmer via les en-têtes de réponse HTTP (`curl -I`) que le CSP attendu est bien présent sur `/` et différent sur `/dashboard.html`, et que le dashboard continue de fonctionner (pas d'erreur console liée à un script/style bloqué).
