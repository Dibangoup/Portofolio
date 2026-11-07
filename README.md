# Portfolio de Jordan DIBANGOUP

Portfolio d'étudiant en génie logiciel, bilingue (FR/EN), avec un tableau de bord d'administration pour modifier le contenu sans toucher au code.

L'accueil prend la forme d'un petit bureau, **JordanOS** : une fenêtre d'éditeur de code, une fenêtre photo, un terminal rangé dans la barre des tâches et une palette de commandes. Les sections qui suivent (projets, à propos, parcours, compétences, contact) restent volontairement sobres.

Site en ligne : <https://portfolio-gamma-one-73.vercel.app>

## Fonctionnalités

- **Accueil « JordanOS »** : éditeur (`bienvenue.md`, `jordan.ts`), photo, projets et terminal dans des fenêtres déplaçables, avec barre des tâches, menu démarrer et horloge.
- **Terminal interactif** : tapez `help` (autres commandes : `whoami`, `neofetch`, `ls`, `projets`, `apropos`, `parcours`, `competences`, `contact`, `cv`, `email`, `code`, `open`, `lang`, `clear`, `exit`). La touche Tab complète la commande.
- **Palette de commandes** : `Ctrl + K`.
- **Contenu piloté par les données** : tout le texte vient de `public/js/portfolio-data.js`.
- **Bilingue FR/EN** et **thème clair/sombre** (préférence du système, modifiable par bouton).
- **Études de cas** dans des boîtes de dialogue natives.
- **CV en PDF** : la fenêtre « Mon CV » affiche le PDF envoyé depuis le dashboard, page par page (lecteur [PDF.js](https://mozilla.github.io/pdf.js/) hébergé dans le site, qui fonctionne aussi sur téléphone), avec un bouton « Télécharger en PDF ».
- **Formulaire de contact** envoyé via Web3Forms.
- **PWA** : installable et utilisable hors ligne (`service-worker.js`).
- **Accessible et progressif** : le site reste lisible sans JavaScript, respecte `prefers-reduced-motion` et se manipule au clavier.
- **Dashboard d'administration** (local) : édition en direct avec aperçu, envoi du CV en PDF, et **publication automatique sur GitHub** à chaque enregistrement (Vercel redéploie le site). Protégé par mot de passe.

## Démarrage

Prérequis : [Node.js](https://nodejs.org) **22 ou plus récent** (les tests utilisent `node --test` avec un motif de fichiers, disponible depuis Node 21) et Git.

```bash
npm install
cp .env.example .env     # puis renseignez DASHBOARD_USER et DASHBOARD_PASSWORD
npm run dev
```

- Site : <http://localhost:3000>
- Dashboard : <http://localhost:3000/dashboard.html> (identifiants du fichier `.env`)

Le serveur n'écoute que sur `127.0.0.1` : le dashboard n'est joignable que depuis votre propre machine, pas depuis le réseau local.

Pour changer de port : `PORT=3217 node server.js` (ou la variable `PORT` dans `.env`).

### Variables d'environnement

| Variable | Rôle |
| --- | --- |
| `DASHBOARD_USER` | Identifiant du dashboard (par défaut `admin`) |
| `DASHBOARD_PASSWORD` | Mot de passe du dashboard. **Sans lui, le dashboard et la sauvegarde restent bloqués (503)** : il n'y a volontairement aucun mot de passe par défaut. |
| `GIT_AUTO_PUBLISH` | `true` : chaque **Enregistrer** du dashboard fait un commit et un push sur `main` (voir plus bas). Absent ou autre valeur : l'enregistrement reste sur votre ordinateur. Git doit déjà être authentifié sur la machine. |
| `PORT` | Port du serveur (par défaut `3000`) |

Le fichier `.env` n'est jamais commité.

## Modifier le contenu

1. Lancez `npm run dev` et ouvrez le dashboard. Modifiez les textes, projets, compétences ou parcours : l'aperçu et le site ouvert dans un autre onglet se mettent à jour en direct.
2. Cliquez sur **Enregistrer** : le serveur réécrit `public/js/portfolio-data.js`, puis, si `GIT_AUTO_PUBLISH=true`, le publie sur GitHub. Un message indique si la publication a réussi ou pourquoi elle n'a pas eu lieu.

Les sections modifiables sont `hero`, `about`, `skills`, `timeline`, `projects`, `cv` et `contact`. Toute autre clé est refusée par le serveur.

### Mettre à jour le CV

Dans l'onglet **Mon CV (PDF)** du dashboard, choisissez votre fichier puis **Envoyer le PDF** (5 Mo maximum). Le PDF est enregistré dans `public/cv/` sous un nom aléatoire, l'ancien est supprimé, puis le contenu est enregistré (et publié). L'aperçu montre le rendu exact de la fenêtre « Mon CV » du site.

Le PDF est **public** : toute personne qui visite le site peut le télécharger, et il reste dans l'historique Git.

Les anciens champs du CV (identité, contact, langues, expériences, formations) sont masqués mais conservés dans les données. Le champ **Bandeau des technologies** du même onglet alimente le bandeau de la page d'accueil.

### Publication automatique sur GitHub

Avec `GIT_AUTO_PUBLISH=true`, chaque enregistrement commit et pousse **uniquement** `public/js/portfolio-data.js` et `public/cv/`, jamais votre autre travail en cours. La publication est refusée, avec un message, si :

- la branche courante n'est pas `main` ;
- des fichiers sont déjà préparés dans Git (`git add`) ;
- des commits locaux ne sont pas encore poussés.

Si un push est refusé (le dépôt GitHub a avancé), synchronisez puis enregistrez à nouveau :

```bash
git pull --rebase --autostash
git push
```

> ⚠️ Enregistrer depuis le dashboard **écrase le fichier de données réel**, et le **publie sur le site** si `GIT_AUTO_PUBLISH=true`. Pour expérimenter, retirez cette variable de `.env`, ou faites une copie de `portfolio-data.js`.

## Structure du projet

```
Portofolio/
├── server.js               Serveur Express : fichiers statiques, authentification, /api/save, /api/cv, /api/status
├── dashboard.html          Dashboard d'administration (hors du dossier public)
├── vercel.json             Déploiement Vercel et en-têtes de sécurité du site en ligne
├── package.json
├── .env.example            Modèle de configuration
├── scripts/
│   └── vendor-pdfjs.js     Copie PDF.js dans public/vendor/pdfjs/
├── tests/                  Tests automatisés (npm test)
└── public/                 Seul dossier servi publiquement
    ├── index.html
    ├── manifest.json, service-worker.js
    ├── images/
    ├── cv/                 CV en PDF envoyé depuis le dashboard
    ├── vendor/pdfjs/       Lecteur PDF.js (copie figée, commitée)
    ├── css/
    │   ├── tokens.css      Couleurs, typographies, espacements, thèmes
    │   ├── components.css  Boutons, champs, cartes, boîtes de dialogue, pages du CV
    │   ├── layout.css      Mise en page des sections
    │   ├── os.css          Bureau JordanOS (fenêtres, éditeur, terminal, barre des tâches)
    │   ├── print.css       Styles d'impression
    │   ├── dashboard-os.css  Habillage du dashboard
    │   └── fonts/          Polices auto-hébergées
    └── js/
        ├── theme-init.js   Thème appliqué avant l'affichage
        ├── portfolio-data.js  Données du site (réécrit par le dashboard)
        ├── icons.js        Icônes Phosphor (fichier généré)
        ├── cv-viewer.js    Lecteur du CV en PDF (site et aperçu du dashboard)
        ├── app.js          Rendu des sections, i18n, formulaire, dialogues
        └── os.js           Bureau JordanOS : fenêtres, terminal, palette
```

## Scripts

| Commande | Effet |
| --- | --- |
| `npm run dev` | Compile le CSS Tailwind puis lance le serveur |
| `npm start` | Lance le serveur sans recompiler le CSS |
| `npm test` | Lance les tests (envoi du CV, publication Git, sécurité des routes, en-têtes Vercel, lecteur PDF) |
| `npm run vendor:pdfjs` | Recopie PDF.js dans `public/vendor/pdfjs/`, **à lancer après toute mise à jour de `pdfjs-dist`** (un test échoue sinon) |
| `npm run build:css` | Compile `tailwind-src.css` en `tailwind-build.css` (utilisé par le dashboard uniquement) |
| `npm run watch:css` | Recompile à chaque modification |

Le site public n'utilise plus Tailwind : il s'appuie sur les fichiers `tokens`, `components`, `layout` et `os`.

## Sécurité

- **Politique CSP stricte** sur le site, en local (`helmet`) comme en ligne (`vercel.json`) : scripts, styles et polices uniquement depuis le même domaine, aucun script ni style en ligne. Un test vérifie que les deux politiques restent identiques. Le dashboard a sa propre politique.
- **En-têtes HTTP** en local et sur Vercel : `nosniff`, interdiction d'afficher le site dans un cadre, HSTS, `Referrer-Policy: no-referrer`.
- **Authentification HTTP Basic côté serveur** pour `/dashboard.html`, `/api/save` et `/api/cv` (comparaison à temps constant), avec limitation à 20 échecs par 15 minutes. Le corps des requêtes n'est lu qu'**après** l'authentification.
- **Protection CSRF** : les routes d'écriture exigent un en-tête personnalisé que seul un script de même origine peut poser.
- **Envoi du CV** : PDF uniquement (en-tête `%PDF-` vérifié, pas seulement le type annoncé), 5 Mo maximum, nom de fichier aléatoire ; le lien enregistré est validé (format, type, fichier existant).
- **Validation des données** : clés de premier niveau autorisées uniquement, clés dangereuses (`__proto__`, `constructor`, `prototype`) retirées récursivement, corps limité à 10 Mo.
- **Publication Git** : commandes lancées sans shell, chemins fixes, délai maximal d'une minute, aucune demande d'identifiants interactive.
- **Erreurs génériques** : aucune trace technique n'est renvoyée au navigateur.
- Serveur local limité à `127.0.0.1`, et un dossier `public/` isolé du code serveur.

## Déploiement (site statique sur Vercel)

Seul le site public (`public/`) est mis en ligne ; le **dashboard reste local** et n'est pas déployé (sur Vercel, le disque est en lecture seule).

1. Connecter le dépôt `Dibangoup/Portofolio` sur [vercel.com](https://vercel.com).
2. Vercel lit `vercel.json` : site statique sans framework (`"framework": null`), dossier `public/`, en-têtes de sécurité. Aucun build n'est nécessaire.

Chaque push sur `main` redéploie le site. Pour mettre le contenu à jour :

- **Avec `GIT_AUTO_PUBLISH=true`** : modifiez le contenu dans le dashboard local et cliquez sur **Enregistrer**. Le push est fait pour vous.
- **Sans** : après **Enregistrer**, publiez à la main :

  ```bash
  git add public/js/portfolio-data.js public/cv
  git commit -m "Mise à jour du contenu"
  git push
  ```

Si vous ajoutez un service externe au site (statistiques, police Google, vidéo intégrée), autorisez-le dans la CSP de `vercel.json` **et** de `server.js`, sinon le navigateur le bloque.

## Technologies

Node.js, Express, HTML/CSS/JavaScript sans framework, PDF.js (lecteur du CV), Tailwind CSS (dashboard), Phosphor Icons. Polices auto-hébergées : Bricolage Grotesque, Geist, Geist Mono et JetBrains Mono.

## Historique des refontes

Le dossier `docs/superpowers/` conserve les plans et spécifications des refontes précédentes (éditorial, « Le Journal », « Carte Céleste »). Le design actuel, « Atelier » avec la couche JordanOS, est la refonte la plus récente.

## Auteur

**Jordan DIBANGOUP**, étudiant en ingénierie du génie logiciel, Abidjan (Côte d'Ivoire).

## Licence

MIT
