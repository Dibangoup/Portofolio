# Refonte visuelle du portfolio — direction "Le Journal" (broadsheet éditorial)

**Statut :** proposé, en attente de revue utilisateur
**Portée :** `index.html`, `css/*.css` (hors `dashboard.css`), `js/app.js`
**Hors portée :** `dashboard.html`, `css/dashboard.css`, `server.js`, le schéma de données `js/portfolio-data.js`

## 1. Contexte et objectif

Ce spec **remplace** `docs/superpowers/specs/2026-07-26-portfolio-editorial-redesign-design.md`. La direction éditoriale noir & blanc "Dossier" y avait été approuvée et partiellement implémentée (Tasks 1 à 4 sur 11, dans la branche/worktree `portfolio-editorial-redesign`). En parallèle de cette implémentation, l'utilisateur a demandé à comparer d'autres directions visuelles (19 prototypes générés au total) et a finalement retenu **"Le Journal"** — une direction broadsheet/presse imprimée — plutôt que "Dossier".

Cette refonte reprend le même objectif de fond (rompre avec le Material-You violet/glassmorphic générique actuel) mais avec un langage visuel différent : plutôt qu'un dossier de fiches N&B, le site devient une véritable page de journal papier — masthead, colonnes de texte, lettrine, bylines, brèves, brief-box.

**Continuité technique :** on reste dans la même branche/worktree (`portfolio-editorial-redesign`) plutôt que d'en recréer une. Les fondations déjà posées (Tasks 1-2 : tokens couleur/police Tailwind, lois CSS globales zéro-radius/zéro-ombre, classe `.grayscale-emoji`) sont conservées avec un ajustement mineur (voir §3) ; les tâches structurelles (nav, hero, about, skills, projets, modales) sont reprises depuis zéro pour la structure journal.

**Contrainte non négociable, inchangée :** `js/portfolio-data.js` ne change pas de forme. Tous les `id` HTML actuellement ciblés par `js/app.js` (voir §7) doivent continuer d'exister avec le même nom et le même comportement.

## 2. Direction validée (résumé des décisions prises en brainstorming)

- Style : broadsheet éditorial (masthead, colonnes de texte, filets doubles, lettrine, bylines) — pas de glassmorphism, pas de dégradés colorés.
- Portée : reskin fidèle **+** repenser structurellement certaines sections (nav → masthead, projets → brèves, modale projet → page d'article) — pas un simple changement de couleurs.
- Typographie : le même trio déjà chargé pour "Dossier" est réutilisé, avec des rôles réassignés — Fraunces pour le nameplate/titres, Source Serif 4 pour le corps de texte en colonnes, IBM Plex Mono pour les labels/bylines/dates/kickers. Aucun nouveau chargement de police nécessaire.
- Images : traitement noir & blanc / trame demi-teinte **partout** (portrait, vignettes projets, image de la modale) — contrairement à "Dossier" qui réservait la couleur au survol/à la modale, "Le Journal" assume le monochrome intégral, cohérent avec une vraie édition imprimée.
- Accent : une seule couleur d'accent, l'oxblood déjà défini pour "Dossier" (`#7A1F1F`) est réutilisé tel quel (le prototype de comparaison utilisait `#A3231C`, très proche — on garde la valeur déjà en config pour ne rien changer inutilement).
- Thème : mode clair forcé conservé (`class="light"` sur `<html>`), pas de bascule sombre.
- Prototype de validation : `Le Journal — Prototype Portfolio Broadsheet` (Hero + Projets), approuvé par l'utilisateur parmi 19 directions comparées.

## 3. Design tokens

### Couleurs

| Token | Valeur | Usage |
|---|---|---|
| `--paper` | `#FDFCF7` | Fond principal — léger blanc chaud "papier journal" (ajustement mineur depuis `#FFFFFF`) |
| `--paper-dim` | `#F2F0E6` | Fond légèrement distinct (encadrés, brief-box, alternance de section) |
| `--ink` | `#111111` | Texte principal, filets, boutons pleins (inchangé) |
| `--ink-70` | `rgba(17,17,17,.68)` | Texte secondaire (inchangé) |
| `--ink-45` | `rgba(17,17,17,.45)` | Texte tertiaire, séparateurs (inchangé) |
| `--accent` | `#7A1F1F` (oxblood, inchangé) | Kicker, statut disponibilité, rubrique active, filet du nameplate — jamais en remplissage de bouton |

Contraste re-vérifié sur le nouveau `--paper` (`#FDFCF7`, légèrement plus chaud que le blanc pur précédent) : `--ink` sur `--paper` ≈ 18.4:1 (AAA, quasi identique aux 18.9:1 précédents). `--accent` sur `--paper` ≈ 10:1 (AAA, quasi identique aux 10.3:1 précédents). Écart négligeable, aucune re-vérification supplémentaire nécessaire pour les autres couples.

### Typographie

| Rôle | Police | Usage |
|---|---|---|
| Nameplate + titres | **Fraunces** (600–900) | Nameplate du masthead, `h1`/`h2` de section, titres d'article (modale projet) |
| Corps de texte | **Source Serif 4** (400, 600) | Paragraphes en colonnes, bylines, brèves |
| Mono (labels, données) | **IBM Plex Mono** (400, 500, 600) | Dateline, kickers, bylines-meta, tags techniques, dates, numéros de page/rubrique |

Aucun changement d'infrastructure : même mécanisme `<link>` Google Fonts déjà en place depuis Task 1.

### Autres tokens

- Filets : traits pleins uniquement, filet simple 1px pour les séparateurs de liste/colonne, **filet double** (`border: 5px double var(--ink)`) réservé aux en-têtes/pieds de grandes sections (masthead, rupture avant Projets), pour marquer la structure "page de journal". Zéro `border-radius` conservé partout (loi héritée de Task 2).
- Ombres : aucune (loi héritée de Task 2).
- Colonnes : `column-count: 2` (texte continu type biographie/brèves) avec repli `column-count: 1` sous 820-860px selon la section ; jamais utilisé pour des éléments cliquables (voir §5.5).
- Densité : espacements existants (`--space-*` via `tailwind.config.js`) conservés sans renommage.

## 4. Traitement des images

- Portrait du Hero (`#hero-img`) : trame demi-teinte + N&B en permanence (`filter: grayscale(1) contrast(1.05)`, plus un overlay de points via `background-image` radial répété en `mix-blend-mode: multiply` sur un pseudo-élément, pour l'effet d'impression), cadre rectangulaire à bordure noire 1.5px.
- Vignettes de projets (`#projects-grid`) : même traitement grayscale + trame, **sans** réapparition de couleur au survol (contrairement à "Dossier") — cohérence avec le monochrome intégral de l'édition imprimée.
- Image dans la modale de détail projet (`#project-modal-content`) : même traitement grayscale + trame, pas de couleur pleine.
- Aucune modification du champ `image` dans le schéma de données ni du dashboard — traitement purement CSS sur l'élément `<img>`.

## 5. Section par section

### 5.1 Navigation (`<nav id="navbar">`) → masthead

- `#nav-logo` devient le nameplate "Le Journal de Jordan" (ou variante courte en desktop étroit), toujours mis à jour dynamiquement avec le nom via `renderHero()`.
- Une ligne de dateline au-dessus du nameplate ("ÉDITION NUMÉRIQUE — Nº 001", en mono petites capitales), texte statique purement décoratif — le statut de disponibilité réel reste affiché une seule fois, dans `#hero-availability` (§5.2), pas dupliqué ici.
- Liens de nav : petites capitales séparées par des filets verticaux `border-left: 1px solid var(--ink)`, pas de pastille active colorée.
- `#scroll-progress` : filet fin `--accent` plutôt que dégradé.
- `#cv-btn` : bouton outline mono.
- Menu mobile (`#mobile-nav-overlay`) : fond `--ink`, liens `--paper` en grand serif, mécanisme JS inchangé (Task 3, déjà fait, conservé sans modification).

### 5.2 Hero (`#hero`)

Conforme au prototype "Le Journal" approuvé :
- `#hero-availability` : kicker mono avec point encré `--accent` pulsant, positionné comme un chapeau d'article ("UNE — PORTRAIT").
- `#hero-title` : grand serif Fraunces. Le contenu HTML stocké dans `hero.title` (incluant le `<span class="text-transparent bg-clip-text bg-gradient-to-r ...">`) ne change pas côté données ; la règle CSS ciblant cette combinaison de classes neutralise le dégradé au profit d'un style italique gris (`--ink-70`), comme déjà décidé pour "Dossier" — réutilisé tel quel.
- `#hero-description` : le paragraphe existant (champ `hero.description`, inchangé) est affiché dans un conteneur `column-count: 2` qui le répartit automatiquement sur deux colonnes — aucun texte supplémentaire fabriqué. Lettrine via `::first-letter` sur ce même paragraphe.
- `#hero-img` : traité en trame demi-teinte (§4), légendé en italique mono en dessous ("Jordan Dibangoup, photographié pour cette édition").
- `#hero-badge-1`/`#hero-badge-2` : tags mono simples sous la photo, pas de pastille colorée.
- CTA : bouton plein `--ink` + bouton outline, identique en esprit à "Dossier".
- Le halo de souris (`#mouse-glow`) et les bulles de parallaxe colorées ont déjà été retirés en Task 4 — reste valable, aucune réintroduction.

### 5.3 À propos (`#about`)

- `#about-story-title` + `#about-paragraphs` : deux colonnes de texte (sans lettrine, réservée au Hero), structure HTML inchangée.
- Onglets (`#tab-journey`, `#tab-edu`, `#tab-core`) : mécanisme JS de bascule (classList/containers) **inchangé** ; habillage visuel en "rubriques" — petites capitales séparées par des filets verticaux, rubrique active soulignée `--accent`, même famille visuelle que la nav.
- `#about-education-container` : chaque diplôme en courte notice (date en mono, diplôme en serif gras, école + description en dessous), filet fin entre chaque entrée — pas de carte.
- `#about-values-container` : les 4 valeurs deviennent des encadrés fins (bordure 1px `--ink`, zéro arrondi) ; le champ `emoji` reçoit `.grayscale-emoji` (classe déjà existante depuis Task 2, réutilisée telle quelle).

### 5.4 Compétences (`#skills`)

- `#skills-categories-container` : en-tête de catégorie façon colonne de journal (petites capitales + filet dessous), icônes (palette/database/smartphone) simplifiées en traits fins noirs.
- Barres de compétence (`.skill-bar-fill`, `data-percent`) : piste `--paper-dim`, remplissage `--ink` plein, 2px de haut, zéro arrondi, zéro dégradé (décision validée : barre fine reskinnée, pas de dot-leaders). Structure HTML et logique d'animation au scroll (`triggerSkillsAnimation()`) inchangées.

### 5.5 Projets (`#projects`) — changement structurel principal

- `#projects-grid` : grille de "brèves" uniformes (kicker catégorie mono `--accent`, titre serif gras, description courte, ligne de stack en bas), **en `display:grid`** (pas en `column-count`, réservé au texte continu non cliquable — voir §3) pour rester compatible avec des cartes cliquables contenant une image.
- Filtres (`.filter-btn`, `data-filter`) : classe déjà stylée en Task 2, réutilisée ; le filtrage bascule chaque carte entre `display:none` et `display:block`. Comme toutes les cartes ont désormais une taille uniforme (plus de grille Bento asymétrique), le correctif spécifique `card.style.display = 'grid'` prévu dans l'ancien plan "Dossier" **n'est plus nécessaire** : une bascule `none`/`block` simple suffit, sans risque de déformation.
- `data-project-id`, `data-category` et l'ouverture de la modale au clic restent identiques dans leur logique.
- Modale de détail (`#project-modal`, injectée par `openProjectModal()`) : refonte du template en page d'article — titre en gros serif, ligne de byline (catégorie · stack), image en trame demi-teinte (§4), corps de description en deux colonnes, encadré "EN BREF" à bordure fine listant `features`, ligne de crédit en bas pour le stack technique complet, liens Démo/Code en simples liens soulignés (pas de gros boutons). `#close-project-modal` reste un "✕" discret en coin.

### 5.6 Contact (`#contact`)

- Bloc "Petites annonces" à bordure fine : `#contact-email-link`, `#contact-location-text`, `#contact-github-link`, `#contact-linkedin-link` listés en rubrique de coordonnées, séparés par des filets.
- Formulaire (`#contact-form`, `#form-name`, `#form-email`, `#form-subject`, `#form-message-text`) : champs en style "ligne éditoriale" (soulignement noir, passant à `--accent` au focus), pas de fond ni de carte. Bouton d'envoi en lien souligné gras. Logique de soumission/validation/Web3Forms (§15 de `app.js`) totalement inchangée.

### 5.7 Footer

- Devient le colophon du journal : `#footer-logo` reprend le nameplate en petit, `#footer-copyright` s'accompagne d'une mention d'édition ("Édition numérique · Nº 001"), séparé par un filet double.

### 5.8 Modale CV (`#cv-modal`, injectée par `openCvModal()`)

Mise en page façon feuille de style dossier de presse : une colonne, identité en tête (nom, rôle, disponibilité), rubriques Compétences / Langues / Expériences / Formations séparées par des filets fins, dans le même esprit que la modale projet mais plus dense/imprimable. `#close-cv-modal` cohérent avec `#close-project-modal`. Bouton "Télécharger le CV PDF" et sa simulation (`#download-pdf-btn`, §7 de `app.js`) inchangés fonctionnellement.

### 5.9 Toasts (`#toast-container`, `showToast()`)

Réhabillés en "dépêches" : bandeau fin à bordure noire, kicker "DERNIÈRE MINUTE" en `--accent`, message en dessous, zéro arrondi/ombre. Logique d'affichage/disparition inchangée.

### 5.10 Section "Parcours" (désactivée/commentée)

Reste désactivée — hors scope, comme pour "Dossier".

## 6. Animations et interactions

Conservé sans changement de comportement (uniquement les styles CSS des éléments concernés) :
- Scroll reveal (`IntersectionObserver` + `.reveal`/`.active`)
- Rétrécissement de la navbar au scroll
- Animation des barres de compétences au scroll
- Bascule des rubriques À propos
- Filtrage des projets (simplifié, voir §5.5)
- Menu mobile overlay
- Validation + soumission du formulaire de contact
- Écoute `storage` pour la prévisualisation live depuis le dashboard (`renderAll()`)

Déjà supprimé en Task 4 (reste valable, aucune réintroduction) : halo de souris coloré (`#mouse-glow`), bulles de parallaxe colorées (`.parallax-bg`, `.parallax-bg-bottom`).

Toutes les animations respectent déjà `prefers-reduced-motion` (calculé une fois en haut de `app.js`) — comportement conservé.

## 7. Contrat d'identifiants à préserver (checklist d'implémentation)

Identique à la liste déjà validée pour "Dossier" (aucun `id` ne change entre les deux directions, seule l'habillage visuel change) :

`navbar`, `scroll-progress`, `nav-logo`, `menu-toggle`, `mobile-nav-overlay`, `.mobile-nav-link`, `hero` (section), `hero-availability`, `hero-title`, `hero-description`, `hero-img`, `hero-badge-1`, `hero-badge-2`, `about-story-title`, `about-paragraphs`, `about-journey-1`, `about-journey-2`, `about-education-container`, `about-values-container`, `.tab-btn`/`data-tab` (`#tab-journey`, `#tab-edu`, `#tab-core`), `.tab-content`/`tab-{name}`, `skills` (section), `skills-categories-container`, `.skill-bar-fill`/`data-percent`, `projects-grid`, `.project-card`/`data-category`/`data-project-id`, `.filter-btn`/`data-filter`, `project-modal`, `close-project-modal`, `project-modal-content`, `cv-btn`, `cv-modal`, `close-cv-modal`, `cv-modal-content`, `contact-email-link`, `contact-location-text`, `contact-github-link`, `contact-linkedin-link`, `footer-logo`, `footer-copyright`, `contact-form`, `form-name`, `form-email`, `form-subject`, `form-message-text`, `form-message`, `toast-container`.

Déjà retirés en Task 4 (reste valable) : `mouse-glow`, `.parallax-bg`, `.parallax-bg-bottom`.

## 8. Cartographie des fichiers CSS

Même découpage modulaire que "Dossier" (pas de renommage de fichiers) :

| Fichier | Rôle actuel | Changement pour "Le Journal" |
|---|---|---|
| `style.css` | Point d'entrée, imports | Inchangé |
| `glass.css` | Surfaces (déjà réécrit en Task 2 pour surfaces à bordure) | Ajustement mineur : `--paper` légèrement chaud (§3) |
| `animations.css` | Keyframes (déjà nettoyé en Task 4) | Inchangé |
| `scrollbar.css` | Scrollbar custom | Inchangé (déjà N&B depuis Task 2) |
| `components.css` | Onglets, jauges, cartes projets, formulaires | Réécrit : masthead, rubriques, grille de brèves, barres fines, champs ligne |
| `layout.css` | Timeline (désactivée) | Inchangé, hors scope |
| `overlays.css` | Menu mobile, modales, toasts | Réécrit : modale projet en page d'article, modale CV en dossier de presse, toasts en dépêches |
| `utilities.css` | Barre de progression, trame demi-teinte des images | Ajout du traitement trame demi-teinte partagé (§4), barre de progression déjà recolorée en Task 2 |

`tailwind.config.js` : tokens déjà posés en Task 1, ajustement mineur de `--paper` uniquement (§3).

## 9. Accessibilité (checklist)

- Contraste : voir §3, tous les couples texte/fond ≥ 4.5:1 (18.4:1 et 10:1 mesurés).
- Focus visible : liens/boutons/rubriques conservent un contour visible (`--ink` ou `--accent`), jamais supprimé.
- Cibles tactiles : nav, rubriques, filtres ≥ 44×44px de zone cliquable.
- Colonnes de texte (`column-count: 2`) : largeur de colonne vérifiée ≥ 25ch pour rester lisible, jamais appliqué à un élément cliquable ou contenant une image (voir §3/§5.5).
- `alt` sur les images conservés/vérifiés.
- `prefers-reduced-motion` : déjà respecté, aucune régression attendue.

## 10. Hors scope / non demandé

- Pas de changement du schéma `portfolio-data.js` ni du dashboard.
- Pas de bascule dark/light (thème unique assumé), les 3 règles `html.dark` mortes restaurées en Task 2 restent inchangées.
- Pas de réactivation de la section "Parcours".
- Pas de changement du formulaire de contact (Web3Forms) ni de sa logique de validation.
- Pas de changement de la protection par mot de passe du dashboard ni de `server.js`.
