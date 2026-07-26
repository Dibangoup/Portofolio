# Refonte visuelle du portfolio — direction éditoriale noir & blanc

**Statut :** proposé, en attente de revue utilisateur
**Portée :** `index.html`, `css/*.css` (hors `dashboard.css`), `js/app.js`
**Hors portée :** `dashboard.html`, `css/dashboard.css`, `server.js`, le schéma de données `js/portfolio-data.js`

## 1. Contexte et objectif

Le portfolio actuel (`index.html`) est en Material-You clair, glassmorphic, violet/bleu (`primary #3525cd`, `secondary #006591`, Inter + Plus Jakarta Sans) — un style correct mais générique, proche des tokens Material par défaut. L'objectif est un changement de direction esthétique complet vers un style **éditorial minimaliste noir & blanc**, validé par un prototype visuel (Hero + Projets) que l'utilisateur a approuvé.

Le tableau de bord d'administration (`dashboard.html`) a été refondu séparément (style "Atelier", dark glassmorphic violet) lors d'une session précédente et **n'est pas concerné** par ce changement — les deux surfaces (site public / dashboard privé) assument des identités visuelles différentes, ce qui est acceptable puisque ce sont deux publics différents (visiteurs/recruteurs vs. Jordan lui-même en train d'éditer).

**Contrainte non négociable :** `js/portfolio-data.js` (le schéma de données lu par `app.js` et écrit par le dashboard) ne change pas de forme. Cette refonte est strictement visuelle/structurelle côté présentation — aucun champ n'est ajouté, renommé ou supprimé. Tous les `id` HTML actuellement ciblés par `js/app.js` (voir §7) doivent continuer d'exister avec le même nom, sinon le rendu dynamique et la prévisualisation live du dashboard cassent silencieusement.

## 2. Direction validée (résumé des décisions prises en brainstorming)

- Style : éditorial minimaliste noir & blanc (pas de glassmorphism, pas de dégradés colorés)
- Portée : reskin fidèle **+** repenser la mise en page de certaines sections (pas un simple changement de couleurs) — notamment la grille Bento des projets
- Typographie : serif éditorial marqué pour les titres + police mono pour les labels/données (rupture assumée avec l'Inter/Jakarta actuel)
- Images (portrait + captures projets) : désaturées en noir & blanc partout, sauf réapparition de la couleur au survol des vignettes de projets et dans la modale de détail (couleur complète)
- Accent : une seule couleur d'accent (rouge encre), réservée à des marques d'annotation précises (statut, catégorie, survol) — jamais décorative, jamais sur le CTA principal (qui reste noir plein)
- Thème : mode clair forcé conservé tel quel (`class="light"` sur `<html>`), pas de bascule sombre — choix délibéré cohérent avec le style "Minimalist Monochrome" qui l'impose déjà (voir base de données `ui-ux-pro-max`, domaine `style`)
- Prototype de validation : `Dossier — Prototype Portfolio Éditorial N&B` (Hero + Projets), approuvé par l'utilisateur

## 3. Design tokens

### Couleurs

| Token | Valeur | Usage |
|---|---|---|
| `--paper` | `#FFFFFF` | Fond principal |
| `--paper-dim` | `#F4F4F2` | Fond légèrement distinct (survol de ligne, sections alternées) |
| `--ink` | `#111111` | Texte principal, bordures, boutons pleins |
| `--ink-70` | `rgba(17,17,17,.68)` | Texte secondaire (descriptions, paragraphes) |
| `--ink-45` | `rgba(17,17,17,.45)` | Texte tertiaire (labels mono discrets, séparateurs `·`) |
| `--accent` | `#7A1F1F` (rouge encre / oxblood) | Statut "disponible", catégorie de projet, survol de liens/onglets actifs — **jamais** en remplissage de bouton ni en fond décoratif |

Contraste vérifié (ratio WCAG calculé sur la luminance relative sRGB) : `--ink` sur `--paper` ≈ 18.9:1 (AAA). `--accent` sur `--paper` ≈ 10.3:1 (AAA). `--paper` sur `--ink` (bouton plein, texte inversé) ≈ 18.9:1. Tous les usages de `--accent` restent sur fond clair — pas d'usage prévu sur fond `--ink`, donc pas de vérification supplémentaire nécessaire.

Pas de dark mode : le site reste en thème clair unique et assumé (cf. §2). `js/app.js` §3 (forçage `class="light"`) est conservé sans modification.

### Typographie

Remplace Inter + Plus Jakarta Sans par un trio serif/mono chargé via Google Fonts (même mécanisme `<link>` que l'existant, pas de changement d'infrastructure) :

| Rôle | Police | Usage |
|---|---|---|
| Display (titres, Hero) | **Fraunces** (600–900, italic pour l'accent de phrase) | `h1`, `h2` de section |
| Corps de texte | **Source Serif 4** (400, 600) | Paragraphes, descriptions |
| Mono (labels, données, nav) | **IBM Plex Mono** (400, 500, 600) | Eyebrows de section, statut, tags techniques, dates, numéros |

Choix motivé : Playfair Display (suggéré par défaut pour ce style) est très réutilisé dans les designs génériques — Fraunces offre la même personnalité éditoriale avec un grain plus contemporain et moins vu. JetBrains Mono est remplacé par IBM Plex Mono pour la même raison de différenciation, en gardant une excellente lisibilité tabulaire (`font-variant-numeric: tabular-nums` sur les pourcentages/dates).

### Autres tokens

- Bordures : traits pleins uniquement (1px / 1.5px / 2px selon hiérarchie), jamais de `border-radius` sur les blocs structurels (cartes, boutons, images) — cohérent avec le style "Minimalist Monochrome". Les badges/pastilles arrondies actuels (badges Hero, tags technologiques, catégories) sont tous remplacés par des tags textuels entre crochets mono (`[ Développeur Web ]`), donc aucun élément arrondi ne subsiste dans le nouveau design.
- Ombres : aucune. La profondeur vient uniquement du contraste noir/blanc et de l'inversion de fond, jamais de `box-shadow` flou.
- Densité : espacements généreux (le style éditorial respire), grille de repère utilisant les mêmes variables Tailwind existantes (`--space-*` via `tailwind.config.js` : `sm/md/lg/xl/gutter`) sans les renommer.

## 4. Traitement des images

- Portrait du Hero (`#hero-img`) : `filter: grayscale(1)` permanent, cadre rectangulaire à bordure noire 1.5px (remplace le cadre circulaire flottant actuel).
- Vignettes de projets (grille "dossier", `#projects-grid`) : `filter: grayscale(1) contrast(1.05)` par défaut, transition vers `grayscale(0)` au survol de la carte (`:hover`/`:focus-within`).
- Image dans la modale de détail projet (`#project-modal-content`) : couleur complète, aucun filtre.
- Aucune modification du champ `image` dans le schéma de données ni du dashboard — le filtre est purement CSS, appliqué à l'élément `<img>`, pas aux données.

## 5. Section par section

### 5.1 Navigation (`<nav id="navbar">`)

- Wordmark textuel en mono (majuscules, tracking large) au lieu du logo actuel en Plus Jakarta Sans coloré ; conserve `id="nav-logo"` (toujours mis à jour dynamiquement par `renderHero()` avec le nom).
- Liens de nav numérotés façon en-tête de document (`01 Accueil`, `02 À propos`, …) — légitime ici car les sections forment une vraie séquence de lecture verticale.
- Ligne de progression de scroll (`#scroll-progress`) conservée mais recolorée en `--ink` (au lieu du dégradé actuel).
- Effet de rétrécissement au scroll (§10 de `app.js`) conservé sans changement de logique, seulement de couleurs/bordures.
- Bouton "Mon CV" (`#cv-btn`) : devient un bouton outline mono plutôt que le bouton plein violet actuel.
- Menu mobile plein écran (`#mobile-nav-overlay`, `.mobile-nav-link`) : fond `--ink` avec liens `--paper` en grand serif, numérotés comme la nav desktop.

### 5.2 Hero (`#hero`)

Conforme au prototype approuvé :
- Statut de disponibilité (`#hero-availability`) : point encré `--accent` avec anneau pulsant CSS + label mono, remplace le badge pilule colorée actuel.
- Titre (`#hero-title`) : grand serif Fraunces. Le contenu HTML stocké dans `hero.title` (incluant le `<br>` et le `<span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">`) **ne change pas** — le champ reste identique côté données et côté dashboard. Seule la règle CSS ciblant cette combinaison de classes change : au lieu d'un dégradé coloré, elle applique un style `font-style: italic; color: var(--ink-70); background: none;` (annule `-webkit-background-clip: text` et la couleur transparente). Résultat visuel : la deuxième ligne du titre apparaît en italique grisé plutôt qu'en dégradé violet/bleu, sans toucher au texte ni au champ éditable.
- Description (`#hero-description`) : corps en Source Serif 4.
- Portrait (`#hero-img`) : cadre rectangulaire N&B (voir §4), plus de bulle flottante circulaire ni de badges "glass" en absolute/rotate — les deux badges (`#hero-badge-1`, `#hero-badge-2`) deviennent des tags mono entre crochets sous le portrait.
- CTA : bouton plein `--ink` (`Voir mes projets →`) + bouton outline (`Contact`), remplace les boutons violets à ombre colorée/`btn-shimmer`.
- **Suppression** du halo de souris coloré (`#mouse-glow`, §5 de `app.js`) et des bulles de parallaxe colorées (`.parallax-bg`, `.parallax-bg-bottom`, §9 de `app.js`) : ces effets (glow flouté, bulles primary/secondary) sont incompatibles avec l'austérité N&B voulue. Les éléments HTML et le JS associé sont retirés ensemble (pas de référence orpheline). Remplacement optionnel (à trancher en plan d'implémentation, pas bloquant) : une texture de grain papier très discrète (`opacity: 0.03`) en fond, sans couleur.

### 5.3 À propos (`#about`)

- Colonne gauche (biographie) : typographie mise à jour (serif corps de texte), structure HTML inchangée (`#about-story-title`, `#about-paragraphs`).
- Onglets (`.tab-btn`, `data-tab`) : remplacés visuellement par des onglets soulignés mono (même traitement que les filtres projets, §5.4) au lieu des pastilles pleines actuelles ; logique JS de bascule (§11 de `app.js`) inchangée.
- Onglet "Études" (`#about-education-container`) : chaque diplôme perd le point/ligne colorée (`border-primary/30`, point `bg-primary`) au profit d'un repère mono (dates en `IBM Plex Mono`) + trait vertical `--ink` fin.
- Onglet "Valeurs" (`#about-values-container`) : le champ `emoji` existant (schéma inchangé, toujours éditable depuis le dashboard) reçoit `filter: grayscale(1) contrast(1.1)` pour rester cohérent avec le N&B, sans changer la donnée ni le champ du dashboard.

### 5.4 Compétences (`#skills`)

Repensé en fiche technique plutôt qu'en cartes glass colorées : chaque catégorie devient un bloc avec eyebrow mono (nom de catégorie) et liste de compétences en lignes (nom + pourcentage en mono tabulaire + barre fine `--ink` pleine, remplace la barre dégradée `from-primary to-secondary`). Structure HTML (`#skills-categories-container`, `.skill-bar-fill`, `data-percent`) et logique d'animation au scroll (`triggerSkillsAnimation()`) inchangées — seul le gabarit de rendu injecté par `renderSkills()` change de classes/markup.

### 5.5 Projets (`#projects`) — changement structurel principal

- Grille Bento colorée → **index de dossier numéroté** (voir prototype) : chaque `.project-card` devient une ligne `numéro / titre+description+tags / vignette`, séparée par des traits `--ink` fins, au lieu d'une carte `glass-card` avec image pleine largeur.
- Filtres (`.filter-btn`, `data-filter`) : pastilles pleines colorées → onglets soulignés mono, même logique JS de filtrage (`display:block/none` + fade, §13 de `app.js`) inchangée dans son fonctionnement, seules les classes CSS appliquées par le JS changent.
- Liens rapides démo/code (actuellement icônes rondes blanches en overlay au survol) → tags texte mono entre crochets (`[ demo ]`, `[ code ]`), affichés dans la zone texte de la ligne plutôt qu'en overlay sur l'image.
- `data-project-id`, `data-category` et l'ouverture de la modale au clic (hors clic sur un lien rapide) restent identiques dans leur logique.
- Modale de détail (`#project-modal`, injectée par `openProjectModal()`) : refonte du template HTML injecté — panneau blanc à bordure noire épaisse au lieu de `glass-card` arrondi, image en couleur pleine largeur (voir §4), tags techniques en crochets mono au lieu de pastilles `bg-secondary-fixed`, liste de fonctionnalités avec puce `—` mono au lieu de l'icône Material colorée, boutons Démo/Code en style bouton plein/outline cohérent avec le Hero.

### 5.6 Contact (`#contact`)

- Cartes email/localisation : blocs à bordure fine avec label mono (`EMAIL —`, `LOCALISATION —`) au lieu de `glass-card` + icône carrée colorée.
- Liens sociaux (GitHub/LinkedIn) : tags mono entre crochets au lieu de boutons carrés à bordure arrondie.
- Formulaire (`#contact-form` et ses champs `#form-name`, `#form-email`, `#form-subject`, `#form-message-text`) : champs en style "ligne éditoriale" (bordure basse uniquement, pas de fond ni de carte), labels mono au-dessus. Bouton d'envoi en style bouton plein `--ink` cohérent avec le Hero. Logique de soumission/validation/Web3Forms (§15 de `app.js`) totalement inchangée — uniquement les classes CSS du markup existant.

### 5.7 Footer

- Simplifié : trait `--ink` en haut, wordmark mono, liens mono, copyright mono. `#footer-logo` et `#footer-copyright` restent mis à jour dynamiquement par `renderContact()`.

### 5.8 Modale CV (`#cv-modal`, injectée par `openCvModal()`)

Refonte du template pour ressembler à une vraie page de CV imprimée plutôt qu'à un panneau glass coloré : nom en serif, rôle/disponibilité en dessous, bloc contact en mono, compétences en tags crochets, expériences/formations avec dates en mono tabulaire alignées à droite (pattern déjà présent dans le HTML actuel, juste restylé). Bouton "Télécharger le CV PDF" et sa simulation de génération (`#download-pdf-btn`, §7 de `app.js`) inchangés fonctionnellement.

### 5.9 Toasts (`#toast-container`, `showToast()`)

Toast repensé en bandeau fin à bordure noire avec label de statut mono (`OK —`, `ERREUR —`) au lieu de la carte blanche à icône Material colorée. Logique d'affichage/disparition (`showToast()`) inchangée.

### 5.10 Section "Parcours" (actuellement désactivée/commentée)

Reste désactivée (hors scope) — si l'utilisateur souhaite la réactiver plus tard, elle suivra le même vocabulaire visuel (frise → probablement une liste chronologique mono/serif cohérente avec le nouveau style), mais ce n'est pas demandé ici.

## 6. Animations et interactions

Conservé sans changement de comportement (uniquement les styles CSS des éléments concernés) :
- Scroll reveal (`IntersectionObserver` + `.reveal`/`.active`)
- Rétrécissement de la navbar au scroll
- Animation des barres de compétences au scroll
- Bascule des onglets À propos
- Filtrage des projets
- Menu mobile overlay
- Validation + soumission du formulaire de contact
- Écoute `storage` pour la prévisualisation live depuis le dashboard (`renderAll()`)

Supprimé (incohérent avec la direction N&B, voir §5.2) :
- Halo de souris coloré (`#mouse-glow`)
- Bulles de parallaxe colorées (`.parallax-bg`, `.parallax-bg-bottom`)

Toutes les animations respectent déjà `prefers-reduced-motion` (`app.js` calcule `prefersReducedMotion` une fois en haut du fichier) — ce comportement est conservé tel quel.

## 7. Contrat d'identifiants à préserver (checklist d'implémentation)

Tous ces `id`/attributs doivent rester présents et fonctionnellement identiques après la refonte (liste extraite de `js/app.js`) :

`navbar`, `scroll-progress`, `nav-logo`, `menu-toggle`, `mobile-nav-overlay`, `.mobile-nav-link`, `hero` (section), `hero-availability`, `hero-title`, `hero-description`, `hero-img`, `hero-badge-1`, `hero-badge-2`, `about-story-title`, `about-paragraphs`, `about-journey-1`, `about-journey-2`, `about-education-container`, `about-values-container`, `.tab-btn`/`data-tab`, `.tab-content`/`tab-{name}`, `skills` (section), `skills-categories-container`, `.skill-bar-fill`/`data-percent`, `projects-grid`, `.project-card`/`data-category`/`data-project-id`, `.filter-btn`/`data-filter`, `project-modal`, `close-project-modal`, `project-modal-content`, `cv-btn`, `cv-modal`, `close-cv-modal`, `cv-modal-content`, `contact-email-link`, `contact-location-text`, `contact-github-link`, `contact-linkedin-link`, `footer-logo`, `footer-copyright`, `contact-form`, `form-name`, `form-email`, `form-subject`, `form-message-text`, `form-message`, `toast-container`.

À retirer intentionnellement (avec leur code JS associé, voir §6) : `mouse-glow`, `.parallax-bg`, `.parallax-bg-bottom`.

## 8. Cartographie des fichiers CSS

Structure modulaire existante conservée (pas de renommage de fichiers, pas de nouveau point d'entrée) :

| Fichier | Rôle actuel | Changement |
|---|---|---|
| `style.css` | Point d'entrée, imports | Inchangé |
| `glass.css` | Effets glassmorphism (navbar, cartes) | Contenu remplacé par les styles de surface éditoriaux (cartes à bordure, blocs mono) |
| `animations.css` | Keyframes | Retire les keyframes liées au glow/parallaxe colorés, garde reveal/skill-bar |
| `scrollbar.css` | Scrollbar custom | Recoloré en N&B |
| `components.css` | Onglets, jauges, cartes projets, formulaires | Réécrit pour le nouveau vocabulaire (dossier, onglets soulignés, jauges pleines, champs ligne) |
| `layout.css` | Timeline (désactivée) | Inchangé pour l'instant (hors scope, §5.10) |
| `overlays.css` | Menu mobile, modales, toasts | Réécrit pour panneaux à bordure noire / toasts mono |
| `utilities.css` | Barre de progression, halo de souris | Le halo de souris est retiré ; la barre de progression est recolorée |

`tailwind.config.js` : les tokens de couleur/police Material actuels (`primary`, `secondary`, `background`, `font-display-lg`, etc.) sont soit redéfinis vers la nouvelle palette N&B/typo, soit remplacés par les nouvelles variables CSS custom (`--ink`, `--accent`, etc.) directement dans les fichiers CSS plutôt que via Tailwind — à trancher précisément dans le plan d'implémentation selon ce qui minimise les classes à réécrire dans `index.html`/`app.js`.

## 9. Accessibilité (checklist)

- Contraste : voir §3 (tous les couples texte/fond vérifiés ≥ 4.5:1).
- Focus visible : les liens/boutons/onglets conservent un état focus visible (contour `--ink` ou `--accent` en `outline`, jamais supprimé).
- Cibles tactiles : liens de nav, onglets, tags de filtre ≥ 44×44px de zone cliquable (padding suffisant même si le texte est petit).
- `alt` sur les images (portrait, vignettes projets, image de modale) conservés/vérifiés.
- `prefers-reduced-motion` : déjà respecté par `app.js`, aucune régression attendue puisque les animations supprimées (glow, parallaxe) l'étaient déjà conditionnées par ce media query, et les animations gardées le restent.

## 10. Hors scope / non demandé

- Pas de changement du schéma `portfolio-data.js` ni du dashboard.
- Pas de bascule dark/light (thème unique assumé).
- Pas de réactivation de la section "Parcours".
- Pas de changement du formulaire de contact (Web3Forms) ni de sa logique de validation.
- Pas de changement de la protection par mot de passe du dashboard ni de `server.js`.
