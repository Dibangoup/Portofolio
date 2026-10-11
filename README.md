# Portfolio — Jordan DIBANGOU

Portfolio étudiant interactif : un site vitrine moderne doublé d'un **dashboard d'édition en temps réel** protégé par mot de passe. Le contenu du site (texte, projets, compétences, CV) se modifie depuis une interface admin, sans toucher au code.

**Développeur :** Jordan DIBANGOU — Abidjan, Côte d'Ivoire
**Stack :** HTML5 · CSS3 · JavaScript (ES6+) · Tailwind CSS · Node.js · Express

---

## ✨ Fonctionnalités

- **Site vitrine responsive** — design glassmorphique, animations au scroll, parallaxe, bilingue FR/EN.
- **Dashboard admin sécurisé** — édition de tout le contenu en temps réel (héro, à propos, compétences, projets, CV, contact).
- **CV interactif** — visualiseur + téléchargement PDF.
- **PWA** — installable, mode hors-ligne (service worker + manifest).
- **Formulaire de contact** — envoi via Web3Forms.

## 🔒 Sécurité

Le projet a fait l'objet d'un audit sécurité complet (7 vulnérabilités identifiées et corrigées) :

- **Authentification** du dashboard en HTTP Basic, avec comparaison à temps constant (`timingSafeEqual`).
- **Anti-brute-force** via rate limiting (`express-rate-limit`).
- **Anti-CSRF** sur l'API de sauvegarde (header custom, contre le ré-attachement automatique du Basic Auth).
- **Anti-pollution de prototype** — purge récursive de `__proto__` / `constructor` / `prototype`.
- **Double Content-Security-Policy** (stricte pour le site public, permissive pour le dashboard) via `helmet`.
- **Échappement XSS systématique** (`escapeHtml` + validation d'URL `safeUrl`) sur toutes les données du dashboard.
- **Contournement de chemin neutralisé** (normalisation des slashs, blocs de chemins internes).

## 🚀 Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les identifiants du dashboard
cp .env.example .env
#    puis définir DASHBOARD_PASSWORD dans .env (jamais commité)

# 3. Compiler le CSS Tailwind (si modifié)
npm run build:css

# 4. Lancer le serveur
npm run dev
```

- **Site public :** http://localhost:3000
- **Dashboard :** http://localhost:3000/dashboard.html (protégé par mot de passe)

> ⚠️ Sans `DASHBOARD_PASSWORD` défini, le dashboard et la sauvegarde restent bloqués (503).

## 🗂 Structure

```
├── public/                  # Fichiers servis (site public uniquement)
│   ├── index.html
│   ├── css/                 # Styles (Tailwind + CSS custom)
│   ├── js/
│   │   ├── app.js           # Rendu du site + logique
│   │   ├── portfolio-data.js # Données du portfolio (générées par le dashboard)
│   │   └── icons.js
│   ├── images/
│   ├── service-worker.js    # PWA hors-ligne
│   └── manifest.json
├── dashboard.html           # Interface admin (protégée)
├── server.js                # Serveur Express + sécurité
└── package.json
```

## 🔧 Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Lance le serveur Express |
| `npm run build:css` | Compile Tailwind (minifié) |
| `npm run watch:css` | Recompile Tailwind à chaque changement |

## 📄 Licence

MIT
