# Refonte visuelle du portfolio — direction "Carte Céleste" (fusion cartographie x réseau)

**Statut :** proposé, en attente de revue utilisateur
**Portée :** `index.html`, `css/*.css` (hors `dashboard.css`), `js/app.js`
**Hors portée :** `dashboard.html`, `css/dashboard.css`, `server.js`, le schéma de données `js/portfolio-data.js`

## 1. Contexte et objectif

Une précédente direction, "Le Journal" (broadsheet éditorial), a été entièrement implémentée, revue et corrigée sur la branche/worktree `portfolio-editorial-redesign`. Elle reste intacte et n'est **pas modifiée** par ce travail — cette refonte se fait sur une branche neuve (`portfolio-carte-celeste`), forkée de `main` (qui contient toujours le portfolio Material-You violet/glassmorphic d'origine).

Après "Le Journal", l'utilisateur a exploré de nombreuses autres directions visuelles sous forme de prototypes HTML autonomes (Atelier, Manifeste, Itinéraire, Parallaxe, Signal, Défilé, Isométrique, Encre Vivante, Constellation), affinées sur plusieurs tours d'itération. La demande explicite a été de **fusionner** deux d'entre elles — Constellation (réseau de particules interactif, nœuds connectés) et Itinéraire (parcours cartographique, coordonnées, ligne de route reliant les sections) — en une seule direction cohérente : **Carte Céleste**, où le pont conceptuel entre les deux est la navigation céleste (se repérer en reliant des étoiles).

Ce prototype a ensuite été affiné sur trois tours de retours explicites de l'utilisateur :
1. Fusion initiale (canvas d'étoiles + ligne de route + grappes de compétences en nœuds + projets en "étapes").
2. Rendu "plus professionnel" : suppression des badges superposés sur les images, correction d'une duplication de texte (catégorie vs titre), remplacement des vignettes de remplissage décoratives par des esquisses de maquette sobres, atténuation du rebond d'entrée des cartes.
3. Suppression complète du diagramme de nœuds de la section compétences (jugé encore superflu), conservé uniquement le tableau chiffré par catégorie.
4. Meilleure organisation : ajout d'une phrase d'introduction sous chaque titre de section, pour une hiérarchie identique et prévisible partout (titre → contexte → contenu).

Le prototype final validé est un fichier HTML autonome (voir le fil de conversation) qui sert de référence visuelle exacte pour cette refonte. Ce document transpose ce prototype dans le vrai codebase du portfolio, avec ses contraintes propres (schéma de données, contrat d'identifiants JS, sections que le prototype ne couvrait pas).

**Contrainte non négociable, inchangée :** `js/portfolio-data.js` ne change pas de forme. Tous les `id` HTML actuellement ciblés par `js/app.js` (voir §7) doivent continuer d'exister avec le même nom et le même comportement.

**Différence de traitement du thème :** contrairement à "Le Journal" (papier clair, mode forcé `light`), "Carte Céleste" est une direction **sombre assumée** (ciel nocturne). Le portfolio bascule sur ce thème unique sombre — ce n'est pas un mode alternatif ni un bouton de bascule, c'est le seul thème du site (même logique qu'un thème clair unique forcé, mais en sombre). La classe `light` sur `<html>` est retirée ; aucune classe `dark` n'est ajoutée non plus (pas de mécanisme de bascule à construire) — les tokens de couleur eux-mêmes définissent un site sombre par défaut.

## 2. Direction validée (résumé des décisions prises en brainstorming)

- Concept : la ligne de route d'Itinéraire (colonne vertébrale qui relie chaque section à un repère) devient une ligne d'étoiles ; les grappes de compétences de Constellation se simplifient en tableau chiffré transparent (pas de diagramme, sur demande explicite) ; le champ de particules interactif de Constellation devient le ciel nocturne du hero, avec les coordonnées réelles d'Abidjan et le portrait en carte postale hérités d'Itinéraire.
- Palette : fusion des deux accents d'origine (terracotta d'Itinéraire, magenta de Constellation) en une seule teinte cohérente, l'or/ambre, sur un fond bleu nuit profond.
- Typographie : Space Grotesk (déjà chargé côté prototype), à charger en polices web dans le vrai site (voir §3.2).
- Chaque section de la colonne vertébrale (`Le chemin parcouru`, `Compétences techniques`, `Étapes du parcours`, `Prochaine destination`) démarre par une phrase d'introduction courte (retour utilisateur #4).
- Compétences : tableau chiffré par catégorie uniquement, pas de visualisation en nœuds (retour utilisateur #3).
- Projets : pas de badge superposé sur l'image ; l'étiquette au-dessus du titre affiche la vraie catégorie (`categoryLabel`), jamais un doublon du titre ; entrée au scroll adoucie, sans rebond prononcé (retour utilisateur #2).
- Prototype de validation : fichier `design-carteceleste-final.html` (Hero + Le chemin parcouru + Compétences techniques + Étapes du parcours + Prochaine destination), itéré et approuvé par l'utilisateur.

## 3. Design tokens

### 3.1 Couleurs

| Token | Valeur | Usage |
|---|---|---|
| `--bg` | `#0F1B2E` | Fond principal — ciel nocturne profond |
| `--bg-2` | `#16273D` | Fond des cartes, panneaux, colonnes du tableau de compétences |
| `--bg-3` | `#1D3049` | Fond tertiaire (zone image des cartes projet sans photo réelle) |
| `--ink` | `#F3F1E8` | Texte principal — blanc parchemin chaud, jamais blanc pur |
| `--ink-70` | `rgba(243,241,232,.72)` | Texte secondaire (paragraphes, descriptions) |
| `--ink-45` | `rgba(243,241,232,.52)` | Texte tertiaire (labels, légendes, copyright) — voir note contraste ci-dessous |
| `--line` | `rgba(243,241,232,.14)` | Filets, bordures de carte, séparateurs |
| `--accent` | `#E8A23C` | Or/ambre — statut, liens actifs, repères de la ligne de route, chiffres de compétence, CTA principal |
| `--accent-ink` | `#F0B65E` | Variante plus claire de l'accent, réservée au texte sur fond sombre (labels, kickers) — même teinte, pas un second accent |

**Note de contraste (corrigée par rapport au tout premier brouillon du prototype) :** la valeur initiale de `--ink-45` (opacité .46) mesurait 4.16:1 sur `--bg`, sous le seuil AA (4.5:1) pour du texte de petite taille — utilisée telle quelle sur les libellés de champs et le copyright du footer. Relevée à opacité **.52**, elle atteint 4.98:1 (AA). Les autres couples ont été vérifiés :
- `--ink` sur `--bg` ≈ 15.3:1 (AAA)
- `--ink-70` sur `--bg` ≈ 8.4:1 (AAA)
- `--accent` sur `--bg` ≈ 8:1 (AAA, largement au-dessus du 3:1 requis pour un élément d'UI/large texte)

### 3.2 Typographie

| Rôle | Police | Usage |
|---|---|---|
| Titres | **Space Grotesk** (600, 700), chargée en `@font-face` via fichier woff2 auto-hébergé (voir §3.3) | `h1`/`h2` de section, nameplate nav |
| Corps de texte | Pile système (`-apple-system, "Segoe UI", Helvetica, Arial, sans-serif`) | Paragraphes, descriptions, formulaire |
| Mono (labels, données) | Pile système (`ui-monospace, "SF Mono", Consolas, monospace`) | Coordonnées, dates, labels de champ, tags techniques |

### 3.3 Chargement des polices (changement d'infrastructure)

Le site actuel charge ses polices (Inter, Plus Jakarta Sans, Material Symbols) via des balises `<link>` pointant Google Fonts CDN (`fonts.googleapis.com`/`fonts.gstatic.com`), déclarées dans `index.html` (lignes 46-57). Cette refonte remplace ces liens par :
- Un fichier de police auto-hébergé pour Space Grotesk (600 et 700), au format woff2, placé dans `css/fonts/` et référencé via `@font-face` dans `css/style.css` (ou un nouveau fichier `css/fonts.css` importé par `style.css`).
- La suppression des liens `<link>` vers Google Fonts et Material Symbols dans `index.html`.
- Les icônes actuellement fournies par Material Symbols (`<span class="material-symbols-outlined">`) sont remplacées par des SVG en ligne (voir §5), cohérent avec l'absence de dépendance externe du prototype validé.

Raison du changement : le prototype validé n'a jamais dépendu de Google Fonts CDN (contrainte des Artifacts), et l'auto-hébergement est une amélioration légitime (une requête réseau externe de moins, cohérent avec le reste du site qui compile déjà Tailwind en local plutôt qu'en CDN).

### 3.4 Autres tokens

- Rayon de bordure : `--radius: 14px` sur les cartes/panneaux, `999px` (pilule) sur les boutons/badges/filtres. Une seule échelle, appliquée partout (loi de cohérence des formes).
- Ombres : aucune (fidèle au ciel nocturne plat, pas de glassmorphism).
- La classe `light` est retirée de `<html>` dans `index.html` (voir §1).

## 4. Traitement des images

- Portrait du Hero (`#hero-img`) : aucun filtre grayscale/trame (contrairement à "Le Journal") — couleur normale, cadré en carte "postale" avec bordure `--bg-2` et étiquette `mono` en coin ("Point de départ").
- Vignettes de projets (`#projects-grid`) : couleur normale, aucun traitement — le prototype de comparaison utilisait des esquisses de remplacement uniquement parce que 2 des 4 URLs d'images de `portfolio-data.js` ne se chargent pas dans l'environnement isolé des Artifacts (CSP). Sur le vrai site, les 4 projets utilisent leur champ `image` réel sans changement ; aucune esquisse de remplacement n'est nécessaire en production.
- Image dans la modale de détail projet : même traitement (couleur normale, pas de filtre).
- Aucune modification du champ `image` dans le schéma de données ni du dashboard.

## 5. Section par section

### 5.1 Navigation (`<nav id="navbar">`) et menu mobile

- `#nav-logo` : nameplate avec une icône de repère (pin) en SVG inline suivie du nom (rendu dynamiquement via `renderHero()`, inchangé), teintée `--accent-ink` au survol.
- Liens de nav (`.nav-link`) : `À propos`, `Compétences`, `Projets`, `Contact` (inchangés dans leur cible d'ancre — pas de renommage des `href`, uniquement l'habillage visuel change), soulignement `--accent` au survol/actif.
- `#scroll-progress` : filet fin `--accent` en haut de la nav (remplace le dégradé actuel).
- `#cv-btn` : pilule pleine `--accent`, texte `--bg` (contraste vérifié : `--bg` sur `--accent` ≈ le même rapport que `--accent` sur `--bg`, 8:1, largement AA).
- `#menu-toggle` / `#mobile-nav-overlay` / `.mobile-nav-link` : mécanisme JS de bascule **inchangé** ; l'overlay prend le fond `--bg`, liens `--ink` en grand, actif souligné `--accent`.

### 5.2 Hero (`#hero`)

Conforme au prototype validé :
- Un `<canvas>` en pleine largeur derrière le contenu du hero (nouveau, ajouté par JS — voir §6) dessine un champ d'étoiles animé qui relie les points proches par des filets `--accent` semi-transparents ; au passage du curseur, les étoiles proches se relient au curseur en `--accent` plus vif. Respecte `prefers-reduced-motion` (une seule image statique, pas de boucle).
- Une ligne de coordonnées (nouveau bloc statique, non lié aux données) affiche "Abidjan, Côte d'Ivoire · 05.36°N 04.01°O" en mono `--accent-ink`, au-dessus du titre. Valeur réelle (coordonnées d'Abidjan), pas fabriquée.
- `#hero-availability` : conservé comme badge avec puce `--accent` pulsante (respecte `prefers-reduced-motion`), sous les CTA (position identique au prototype).
- `#hero-title` : le contenu HTML stocké dans `hero.title` (incluant le `<span class="text-transparent bg-clip-text bg-gradient-to-r ...">`) ne change pas côté données ; une règle CSS ciblant cette classe neutralise le dégradé au profit de `--ink` plein (le prototype ne met pas la deuxième partie du titre en couleur).
- `#hero-description` : paragraphe existant, affiché tel quel sous le titre, `--ink-70`.
- `#hero-img` : dans le cadre "carte postale" (§4), avec l'étiquette "Point de départ" en coin (texte statique, pas de nouveau champ de données).
- `#hero-badge-1` / `#hero-badge-2` : les deux badges texte existants ("Développeur Web", "Développeur Mobile") deviennent des tuiles flottantes discrètes ancrées près du cadre du portrait (repris du prototype "Parallaxe" à l'origine, adapté ici en version simplifiée sans bascule 3D — voir note ci-dessous).
- CTA : bouton plein `--accent`, texte "Voir mes projets" (ancre `#projects`) + bouton outline, texte "Contact" (ancre `#contact`) — labels statiques inchangés dans `index.html`, seul l'habillage visuel change.
- Le halo de souris (`#mouse-glow`) et les bulles de parallaxe colorées (`.parallax-bg`, `.parallax-bg-bottom`) sont retirés du DOM (remplacés conceptuellement par le canvas d'étoiles, qui joue un rôle équivalent en plus riche).

**Note sur les badges flottants :** le prototype "Carte Céleste" validé n'a pas de badges flottants autour du portrait (contrairement à "Parallaxe") ; `#hero-badge-1`/`#hero-badge-2` doivent néanmoins continuer d'exister (contrat d'identifiants) et rester visibles. Ils sont positionnés en tuiles discrètes sous le cadre du portrait plutôt que flottantes en overlay, cohérent avec le style sobre du prototype validé.

### 5.3 À propos (`#about`) → "Le chemin parcouru"

Le prototype validé montre une frise à 3 entrées fixes (Bac 2023, Licence ESATIC 2023→2026, Présent) qui fusionnait librement `about.journey` et `about.education`. La vraie section `#about` a une structure plus riche à préserver : un titre + 2 paragraphes d'intro (`#about-story-title`, `#about-paragraphs`), puis 3 onglets (`data-tab="journey"|"edu"|"core"`) couvrant l'histoire, les études et les valeurs. Voici comment le contrat existant se transpose dans le langage visuel du prototype :

- `#about-story-title` + `#about-paragraphs` : affichés en tête de section, avant les onglets, `--ink-70`, sans mise en colonnes (pas de colonnes de texte dans ce style, contrairement à "Le Journal").
- Onglets (`.tab-btn`/`data-tab`, `#tab-journey`/`#tab-edu`/`#tab-core`) : mécanisme JS de bascule **inchangé** ; habillage visuel en rubriques mono soulignées `--accent` quand actives, cohérent avec le nameplate/nav.
  - `#tab-journey` : `#about-journey-1`/`#about-journey-2` affichés en texte courant (`--ink-70`, sans le composant `.tl-item` qui exige une date réelle) — ces deux paragraphes n'ont pas de date associée dans les données, donc pas de badge de date fabriqué ; seule la liste `#tab-edu` ci-dessous, dont chaque entrée a une vraie date, utilise le composant de frise.
  - `#tab-edu` (`#about-education-container`) : chaque diplôme (`dates`, `degree`, `school`, `desc`) rendu comme une entrée `.tl-item` du prototype — badge de date mono `--accent-ink`, titre = `degree`, description = `school` + `desc`. C'est la correspondance la plus directe et la plus fidèle au prototype (la frise "Le chemin parcouru" du prototype était déjà, dans les faits, une version simplifiée de cette liste).
  - `#tab-core` (`#about-values-container`) : les 4 valeurs (`emoji`, `title`, `desc`) rendues en petites cartes bordurées `--line` sur fond `--bg-2`, disposées en grille 2×2 (desktop) / 1 colonne (mobile). L'émoji reçoit une classe `.muted-emoji` (nouvelle, CSS uniquement — `filter: grayscale(1) opacity(.85)`) pour rester cohérent avec la palette bleu nuit/or à un seul accent, sans supprimer la donnée ni changer le rendu JS.
- Titre de section : "Le chemin parcouru", sous-titre "Du baccalauréat scientifique à la licence en Génie Logiciel, les grandes étapes de ma formation." (texte statique, cohérent avec §2 point 4).

### 5.4 Compétences (`#skills`) → "Compétences techniques"

Conforme à la version finale du prototype (tableau chiffré uniquement, sans diagramme de nœuds — retour utilisateur #3) :
- `#skills-categories-container` : les 3 catégories rendues en colonnes bordurées `--line` sur fond `--bg-2` (composant `.skill-legend` du prototype), en-tête de catégorie mono `--accent-ink`.
- Chaque compétence (`.skill-bar-fill`, `data-percent`) : le nom et le pourcentage en clair (`--accent-ink`, gras, `font-variant-numeric: tabular-nums`), accompagnés d'un filet fin de 2px sous la ligne qui se remplit en `--accent` — l'élément `.skill-bar-fill` et son attribut `data-percent` sont conservés pour que `triggerSkillsAnimation()` continue de fonctionner sans modification, mais son rendu visuel est réduit à ce filet discret plutôt qu'une barre pleine proéminente, cohérent avec le tableau chiffré sobre validé par l'utilisateur.
- Titre de section : "Compétences techniques", sous-titre "Trois domaines travaillés en parallèle, avec le niveau de maîtrise réel pour chaque technologie."

### 5.5 Projets (`#projects`) → "Étapes du parcours"

- `#projects-grid` : cartes "étape" (composant `.stop-card` du prototype) — image en haut (pas de badge superposé, retour utilisateur #2), puis catégorie (`categoryLabel`, jamais le titre dupliqué), titre (`cardTitle`), description courte, tags technologiques, liens.
- Filtres (`.filter-btn`, `data-filter`) : pilules `--accent`/`--ink`, mécanisme de bascule `none`/`block` inchangé.
- `data-project-id`, `data-category` et l'ouverture de la modale au clic : logique identique, inchangée.
- Entrée au scroll : fondu + léger décalage vertical sans rebond prononcé (`cubic-bezier(.16,1,.3,1)`, retour utilisateur #2 — le prototype initial avait un easing à rebond, jugé trop "rebondissant"/pas assez sérieux, corrigé dans l'itération suivante).
- Modale de détail (`#project-modal`, injectée par `openProjectModal()`) : nouveau template "fiche d'étape" cohérent avec le langage du prototype — titre en Space Grotesk, ligne de repère (catégorie · stack), image sans filtre, description, encadré "EN BREF" à bordure `--line` listant `features`, liens Démo/Code en pilules `--accent`/outline. `#close-project-modal` reste un bouton fermeture discret en coin.

### 5.6 Contact (`#contact`) → "Prochaine destination"

Conforme au prototype (composant `.dest-grid`) :
- Icône boussole (SVG inline, nouveau, décoratif) au-dessus de la liste de coordonnées.
- `#contact-email-link`, `#contact-location-text`, `#contact-github-link`, `#contact-linkedin-link` : liste de champs mono avec libellé/valeur, séparés par des filets `--line` (composant `.field-list`/`.field-row`).
- Formulaire (`#contact-form`, `#form-name`, `#form-email`, `#form-subject`, `#form-message-text`) : champs bordurés `--line`, focus `--accent`, fond `--bg-2`. Logique de soumission/validation/Web3Forms (§15 de `app.js`) totalement inchangée.
- Titre de section : "Prochaine destination", sous-titre "Un projet, un stage, une question ? Je réponds à tous les messages."

### 5.7 Footer

- `#footer-logo` : reprend le nameplate (icône repère + nom).
- `#footer-copyright` : inchangé dans son contenu (`© 2026 Jordan Portfolio...`), couleur `--ink-45` (valeur corrigée, §3.1).
- Liens secondaires (`À Propos`/`Compétences`/`Projets`/`Contact`) : inchangés dans leur cible, habillage `--ink-70` → `--accent-ink` au survol.

### 5.8 Modale CV (`#cv-modal`, injectée par `openCvModal()`)

Le prototype ne couvrait pas cette modale (hors périmètre de comparaison). Nouveau template cohérent avec le langage "Carte Céleste" : une colonne, identité en tête (nom, rôle, disponibilité) sur fond `--bg-2`, rubriques Compétences / Langues / Expériences / Formations séparées par des filets `--line`, libellés mono `--accent-ink`. `#close-cv-modal` cohérent avec `#close-project-modal`. Bouton "Télécharger le CV PDF" et sa simulation (`#download-pdf-btn`, §7 de `app.js`) inchangés fonctionnellement.

### 5.9 Toasts (`#toast-container`, `showToast()`)

Bandeau discret `--bg-2` à bordure `--accent` gauche de 3px, texte `--ink`. Logique d'affichage/disparition inchangée.

### 5.10 Section "Parcours" (désactivée/commentée)

Reste désactivée — hors scope, comme pour "Le Journal".

## 6. Animations et interactions

Conservé sans changement de comportement (uniquement les styles CSS des éléments concernés, sauf mention contraire) :
- Scroll reveal (`IntersectionObserver` + `.reveal`/`.active`)
- Rétrécissement de la navbar au scroll
- Animation des barres de compétences au scroll (`triggerSkillsAnimation()`, rendu visuel réduit — voir §5.4)
- Bascule des rubriques À propos
- Filtrage des projets
- Menu mobile overlay
- Validation + soumission du formulaire de contact
- Écoute `storage` pour la prévisualisation live depuis le dashboard (`renderAll()`)

Nouveau, ajouté par cette refonte (fonctions JS additionnelles dans `app.js`, n'affectent aucune fonction `render*()` existante) :
- Champ d'étoiles interactif du hero (canvas 2D, `requestAnimationFrame`, réagit au pointeur), initialisé une fois au chargement et sur `resize`. Respecte `prefers-reduced-motion` (image statique unique).
- Entrée légèrement adoucie des cartes projet au scroll (`IntersectionObserver`, classe `.in`), sans rebond.

Retiré (remplacé conceptuellement par le canvas d'étoiles, §5.2) : halo de souris coloré (`#mouse-glow`), bulles de parallaxe colorées (`.parallax-bg`, `.parallax-bg-bottom`). Aucun changement JS requis pour ce retrait : le code existant (`app.js` lignes ~110-132 et ~641-647) protège déjà ses accès par un test de nullité (`mouseGlow &&`) et par `querySelectorAll` (liste vide si aucun élément) — retirer les éléments du DOM suffit, sans toucher `app.js`.

Toutes les animations respectent déjà `prefers-reduced-motion` (calculé une fois en haut de `app.js`) — comportement conservé, et étendu aux nouvelles animations ajoutées.

## 7. Contrat d'identifiants à préserver (checklist d'implémentation)

Aucun `id` ne change entre l'actuel et cette refonte (seul l'habillage visuel change, sauf `light` retiré de `<html>` et les balises `<link>` de police remplacées, §3.3) :

`navbar`, `scroll-progress`, `nav-logo`, `menu-toggle`, `mobile-nav-overlay`, `.mobile-nav-link`, `hero` (section), `mouse-glow` (retiré, voir §5.2), `.parallax-bg`/`.parallax-bg-bottom` (retirés, voir §5.2), `hero-availability`, `hero-title`, `hero-description`, `hero-img`, `hero-badge-1`, `hero-badge-2`, `about-story-title`, `about-paragraphs`, `about-journey-1`, `about-journey-2`, `about-education-container`, `about-values-container`, `.tab-btn`/`data-tab` (`#tab-journey`, `#tab-edu`, `#tab-core`), `.tab-content`/`tab-{name}`, `skills` (section), `skills-categories-container`, `.skill-bar-fill`/`data-percent`, `projects-grid`, `.project-card`/`data-category`/`data-project-id`, `.filter-btn`/`data-filter`, `project-modal`, `close-project-modal`, `project-modal-content`, `cv-btn`, `cv-modal`, `close-cv-modal`, `cv-modal-content`, `contact-email-link`, `contact-location-text`, `contact-github-link`, `contact-linkedin-link`, `footer-logo`, `footer-copyright`, `contact-form`, `form-name`, `form-email`, `form-subject`, `form-message-text`, `form-message`, `toast-container`.

## 8. Cartographie des fichiers CSS

| Fichier | Rôle actuel | Changement pour "Carte Céleste" |
|---|---|---|
| `style.css` | Point d'entrée, imports | Ajout de l'import du nouveau fichier de police auto-hébergée (§3.3) |
| `glass.css` | Surfaces (glassmorphism Material-You) | Réécrit : tokens couleur sombres (§3.1), plus de glassmorphism (fonds plats `--bg-2`/`--bg-3`) |
| `animations.css` | Keyframes | Ajustement mineur : easing des nouvelles animations (§6), retrait des keyframes du halo/parallaxe devenues inutiles |
| `scrollbar.css` | Scrollbar custom | Recoloré sur les nouveaux tokens sombres |
| `components.css` | Onglets, jauges, cartes projets, formulaires | Réécrit : nav/masthead, rubriques, cartes "étape", tableau de compétences, champs de formulaire |
| `layout.css` | Timeline (désactivée) | Inchangé, hors scope |
| `overlays.css` | Menu mobile, modales, toasts | Réécrit : modale projet "fiche d'étape", modale CV, toasts, menu mobile plein écran |
| `utilities.css` | Barre de progression (`.scroll-progress-bar`), halo de souris (`.mouse-glow`) | `.scroll-progress-bar` recoloré en `--accent` (fini le dégradé violet/bleu) ; `.mouse-glow` retiré (§5.2, §6) ; positionnement du canvas d'étoiles ajouté ici |

`tailwind.config.js` : tokens couleur remappés sur la palette §3.1 (`background`, `surface`, `primary`, `secondary`, etc. redirigés vers les valeurs sombres/or). `index.html` : retrait de la classe `light`, retrait des balises `<link>` Google Fonts/Material Symbols (§3.3).

## 9. Accessibilité (checklist)

- Contraste : voir §3.1, tous les couples texte/fond ≥ 4.5:1 (`--ink-45` corrigé à 4.98:1, les autres ≥ 8:1).
- Focus visible : liens/boutons/rubriques conservent un contour visible (`--accent`), jamais supprimé.
- Cibles tactiles : nav, rubriques, filtres, boutons ≥ 44×44px de zone cliquable.
- `alt` sur les images conservés/vérifiés.
- `prefers-reduced-motion` : respecté pour le canvas d'étoiles (image statique unique), les animations existantes, et les nouvelles entrées de cartes.
- Le canvas d'étoiles (`aria-hidden="true"`) est purement décoratif, aucune information n'y est encodée exclusivement.

## 10. Hors scope / non demandé

- Pas de changement du schéma `portfolio-data.js` ni du dashboard.
- Pas de bascule dark/light (thème sombre unique assumé, pas de mécanisme de bascule à construire).
- Pas de réactivation de la section "Parcours".
- Pas de changement du formulaire de contact (Web3Forms) ni de sa logique de validation.
- Pas de changement de la protection par mot de passe du dashboard ni de `server.js`.
- Pas de correction des deux bugs préexistants de la prévisualisation live (`revealObserver` mal scopé, `projectCardsGrid` obsolète après re-rendu) — documentés séparément, non introduits par cette refonte, hors scope comme pour "Le Journal".
