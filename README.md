# Portfolio de Jordan DIBANGOUP

Portfolio d'étudiant en génie logiciel, bilingue (FR/EN), avec un tableau de bord d'administration pour modifier le contenu sans toucher au code.

L'accueil prend la forme d'un petit bureau, **JordanOS** : une fenêtre d'éditeur de code, une fenêtre photo, un terminal rangé dans la barre des tâches et une palette de commandes. Les sections qui suivent (projets, à propos, parcours, compétences, contact) restent volontairement sobres.

## Fonctionnalités

- **Accueil « JordanOS »** : éditeur (`bienvenue.md`, `jordan.ts`), photo, projets et terminal dans des fenêtres déplaçables, avec barre des tâches, menu démarrer et horloge.
- **Terminal interactif** : tapez `help` (autres commandes : `whoami`, `neofetch`, `ls`, `projets`, `apropos`, `parcours`, `competences`, `contact`, `cv`, `email`, `code`, `open`, `lang`, `clear`, `exit`). La touche Tab complète la commande.
- **Palette de commandes** : `Ctrl + K`.
- **Contenu piloté par les données** : tout le texte vient de `public/js/portfolio-data.js`.
- **Bilingue FR/EN** et **thème clair/sombre** (préférence du système, modifiable par bouton).
- **Études de cas** et **CV** dans des boîtes de dialogue natives ; le CV s'imprime seul (`print.css`).
- **PWA** : installable et utilisable hors ligne (`service-worker.js`).
- **Accessible et progressif** : le site reste lisible sans JavaScript, respecte `prefers-reduced-motion` et se manipule au clavier.
- **Dashboard d'administration** : édition en direct avec aperçu, protégé par mot de passe.

## Démarrage

Prérequis : [Node.js](https://nodejs.org) 18 ou plus récent.

```bash
npm install
cp .env.example .env     # puis renseignez DASHBOARD_USER et DASHBOARD_PASSWORD
npm run dev
```

- Site : <http://localhost:3000>
- Dashboard : <http://localhost:3000/dashboard.html> (identifiants du fichier `.env`)

Pour changer de port : `PORT=3217 node server.js` (ou la variable `PORT` dans `.env`).

### Variables d'environnement

| Variable | Rôle |
| --- | --- |
| `DASHBOARD_USER` | Identifiant du dashboard (par défaut `admin`) |
| `DASHBOARD_PASSWORD` | Mot de passe du dashboard. **Sans lui, le dashboard et la sauvegarde restent bloqués (503)** : il n'y a volontairement aucun mot de passe par défaut. |
| `PORT` | Port du serveur (par défaut `3000`) |

Le fichier `.env` n'est jamais commité.

## Modifier le contenu

1. Ouvrez le dashboard, modifiez les textes, projets, compétences, parcours ou le CV : l'aperçu et le site ouvert dans un autre onglet se mettent à jour en direct.
2. Cliquez sur **Enregistrer** : le serveur réécrit `public/js/portfolio-data.js`.

Les sections modifiables sont `hero`, `about`, `skills`, `timeline`, `projects`, `cv` et `contact`. Toute autre clé est refusée par le serveur.

> ⚠️ Enregistrer depuis le dashboard **écrase le fichier de données réel**, y compris pendant des tests. Faites une copie de `portfolio-data.js` avant d'expérimenter, ou interceptez la requête `POST /api/save`.

## Structure du projet

```
Portofolio/
├── server.js               Serveur Express : fichiers statiques, authentification, /api/save, /api/status
├── dashboard.html          Dashboard d'administration (hors du dossier public)
├── package.json
├── .env.example            Modèle de configuration
└── public/                 Seul dossier servi publiquement
    ├── index.html
    ├── manifest.json, service-worker.js
    ├── images/
    ├── css/
    │   ├── tokens.css      Couleurs, typographies, espacements, thèmes
    │   ├── components.css  Boutons, champs, cartes, boîtes de dialogue
    │   ├── layout.css      Mise en page des sections
    │   ├── os.css          Bureau JordanOS (fenêtres, éditeur, terminal, barre des tâches)
    │   ├── print.css       Impression du CV
    │   ├── dashboard-os.css  Habillage du dashboard
    │   └── fonts/          Polices auto-hébergées
    └── js/
        ├── theme-init.js   Thème appliqué avant l'affichage
        ├── portfolio-data.js  Données du site (réécrit par le dashboard)
        ├── icons.js        Icônes Phosphor (fichier généré)
        ├── app.js          Rendu des sections, i18n, formulaire, dialogues
        └── os.js           Bureau JordanOS : fenêtres, terminal, palette
```

## Scripts

| Commande | Effet |
| --- | --- |
| `npm run dev` | Compile le CSS Tailwind puis lance le serveur |
| `npm run build:css` | Compile `tailwind-src.css` en `tailwind-build.css` (utilisé par le dashboard uniquement) |
| `npm run watch:css` | Recompile à chaque modification |

Le site public n'utilise plus Tailwind : il s'appuie sur les fichiers `tokens`, `components`, `layout` et `os`.

## Sécurité

- **Politique CSP stricte** sur le site public : scripts et styles uniquement depuis le même domaine, sans style ni script en ligne. Le dashboard a sa propre politique.
- **Authentification HTTP Basic côté serveur** pour `/dashboard.html` et `/api/save`, avec limitation à 20 échecs par 15 minutes.
- **Protection CSRF** : la sauvegarde exige un en-tête personnalisé que seul un script de même origine peut poser.
- **Validation des données** : clés de premier niveau autorisées uniquement, clés dangereuses (`__proto__`, etc.) retirées, corps limité à 10 Mo.
- `helmet` pour les en-têtes HTTP, et un dossier `public/` isolé du code serveur.

## Technologies

Node.js, Express, HTML/CSS/JavaScript sans framework, Tailwind CSS (dashboard), Phosphor Icons. Polices auto-hébergées : Bricolage Grotesque, Geist, Geist Mono et JetBrains Mono.

## Historique des refontes

Le dossier `docs/superpowers/` conserve les plans et spécifications des refontes précédentes (éditorial, « Le Journal », « Carte Céleste »). Le design actuel, « Atelier » avec la couche JordanOS, est la refonte la plus récente.

## Auteur

**Jordan DIBANGOUP**, étudiant en ingénierie du génie logiciel.
