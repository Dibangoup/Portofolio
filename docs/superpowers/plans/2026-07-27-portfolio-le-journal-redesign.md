# Refonte portfolio "Le Journal" (broadsheet éditorial) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Réhabiller `Portofolio/index.html` + `Portofolio/js/app.js` + `Portofolio/css/*.css` en direction "Le Journal" (broadsheet éditorial), en remplaçant la direction N&B "Dossier" partiellement implémentée (Tasks 1-4/11 d'un plan précédent) dans la même branche/worktree.

**Architecture:** Aucun changement de `js/portfolio-data.js` ni d'infrastructure (build Tailwind CLI, Express server). Tout le travail est un reskin CSS/HTML + templates JS de rendu (`renderHero`, `renderAbout`, `renderSkills`, `renderProjects`, `openProjectModal`, `openCvModal`, `showToast`, `renderContact`) — les signatures et le comportement fonctionnel (filtrage, onglets, formulaire, prévisualisation live) restent identiques, seul le balisage/CSS injecté change.

**Tech Stack:** HTML + Tailwind CSS (compilé via CLI, `npm run build:css`) + CSS modulaire (`css/*.css` importés depuis `style.css`) + JavaScript vanilla (`js/app.js`).

**Contexte de reprise :** Ce plan s'exécute dans la branche/worktree existante `Portofolio/.worktrees/portfolio-editorial-redesign` (créée pour un plan précédent, "Dossier" N&B). Les fondations déjà commitées (tokens Tailwind, lois CSS zéro-radius/zéro-ombre, `.grayscale-emoji`, `.tag-bracket`, `.status-dot`, `.filter-btn`, `.tab-btn.active`, `.glass-card`) sont réutilisées et ajustées à la marge (Task 1) plutôt que recréées. Le nav et le hero déjà implémentés pour "Dossier" (Tasks 3-4 de l'ancien plan) sont repris depuis zéro dans ce plan (Tasks 2-3 ci-dessous) pour la structure masthead/colonnes.

## Global Constraints

- `js/portfolio-data.js` ne change pas de forme — aucun champ ajouté/renommé/supprimé.
- Tous les `id` HTML suivants doivent continuer d'exister avec le même nom et le même comportement fonctionnel : `navbar`, `scroll-progress`, `nav-logo`, `menu-toggle`, `mobile-nav-overlay`, `.mobile-nav-link`, `hero`, `hero-availability`, `hero-title`, `hero-description`, `hero-img`, `hero-badge-1`, `hero-badge-2`, `about-story-title`, `about-paragraphs`, `about-journey-1`, `about-journey-2`, `about-education-container`, `about-values-container`, `.tab-btn`/`data-tab` (`tab-journey`, `tab-edu`, `tab-core`), `.tab-content` (`tab-{name}`), `skills`, `skills-categories-container`, `.skill-bar-fill`/`data-percent`, `projects-grid`, `.project-card`/`data-category`/`data-project-id`, `.filter-btn`/`data-filter`, `project-modal`, `close-project-modal`, `project-modal-content`, `cv-btn`, `cv-modal`, `close-cv-modal`, `cv-modal-content`, `contact-email-link`, `contact-location-text`, `contact-github-link`, `contact-linkedin-link`, `footer-logo`, `footer-copyright`, `contact-form`, `form-name`, `form-email`, `form-subject`, `form-message-text`, `form-message`, `toast-container`.
- Ajouter de **nouveaux** id/éléments est permis (ex : `hero-byline`, `hero-caption`) tant qu'aucun id existant n'est retiré/renommé.
- Couleur d'accent : `#7A1F1F` (oxblood), inchangée. Jamais utilisée en remplissage de bouton.
- `--paper` devient `#FDFCF7`, `--paper-dim` devient `#F2F0E6` (léger blanc chaud "papier journal", contre `#FFFFFF`/`#F4F4F2` actuels).
- Loi CSS globale déjà en place, **ne pas toucher** : `[class*="rounded"]{border-radius:0!important}`, `[class*="shadow"]{box-shadow:none!important}` (dans `css/style.css`).
- Traitement photo : grayscale + trame demi-teinte **partout** (portrait, vignettes projets, image modale) — jamais de réapparition de couleur au survol.
- Les 3 règles `html.dark` mortes déjà restaurées dans le CSS restent inchangées (hors scope, dead code intentionnel).
- Aucun changement à `js/portfolio-data.js`, `dashboard.html`, `css/dashboard.css`, `server.js`.
- Toutes les commandes shell de ce plan s'exécutent depuis `Portofolio/.worktrees/portfolio-editorial-redesign/Portofolio` (c'est là que vivent `package.json`, `index.html`, `css/`, `js/`).

## Verification approach

Pas de framework de test (site statique + vanilla JS). Chaque tâche se vérifie avec :
1. `npm run build:css` (doit se terminer sans erreur — regénère `css/tailwind-build.css`)
2. `node --check js/app.js` (doit sortir sans rien afficher = syntaxe valide)
3. Vérification manuelle ciblée décrite dans la tâche (ouvrir `index.html` dans un navigateur, ou grep sur le fichier modifié pour confirmer la présence des id requis)

---

### Task 1: Fondations — papier journal + cadre trame demi-teinte partagé

**Files:**
- Modify: `tailwind.config.js:16-63` (bloc `colors`)
- Modify: `css/style.css:28-36` (`:root` tokens)
- Modify: `css/utilities.css` (ajout classe partagée)

**Interfaces:**
- Produces: classe CSS `.halftone-frame` (conteneur à poser autour de tout `<img>` qui doit apparaître en N&B + trame demi-teinte) — consommée par Task 3 (Hero), Task 6 (Projets), Task 7 (Modale projet).

- [ ] **Step 1: Mettre à jour les tokens couleur Tailwind pour le "papier journal"**

Dans `tailwind.config.js`, dans le bloc `colors`, remplacer ces 6 lignes (valeurs `"#ffffff"` et `"#f4f4f2"` utilisées comme fonds) :

```js
        "surface-container-low": "#f9f9f8",
```
→ (inchangé, laisser tel quel — ce token n'est pas un blanc pur)

Remplacer précisément ces valeurs :
```js
        "surface-container-high": "#eeeeec",
```
→ (inchangé)

Changer uniquement ces clés (chercher-remplacer la valeur, garder la clé) :
- `"outline-variant": "#111111"` → inchangé
- `"surface-container": "#f4f4f2"` → `"surface-container": "#f2f0e6"`
- `background: "#ffffff"` → `background: "#fdfcf7"`
- `"surface-dim": "#f4f4f2"` → `"surface-dim": "#f2f0e6"`
- `"surface-bright": "#ffffff"` → `"surface-bright": "#fdfcf7"`
- `"surface-container-lowest": "#ffffff"` → `"surface-container-lowest": "#fdfcf7"`
- `"surface-variant": "#f4f4f2"` → `"surface-variant": "#f2f0e6"`
- `surface: "#ffffff"` → `surface: "#fdfcf7"`

Ne pas toucher aux autres clés (`primary`, `secondary`, `on-*`, `error*`, etc.) — elles ne sont pas des fonds blancs/gris clairs.

- [ ] **Step 2: Mettre à jour les tokens CSS custom dans `css/style.css`**

Remplacer le bloc `:root` (lignes 28-36) :

```css
:root {
  --paper: #fdfcf7;
  --paper-dim: #f2f0e6;
  --ink: #111111;
  --ink-70: rgba(17, 17, 17, .68);
  --ink-45: rgba(17, 17, 17, .45);
  --accent: #7a1f1f;
  --accent-soft: rgba(122, 31, 31, .08);
}
```

- [ ] **Step 3: Ajouter la classe partagée `.halftone-frame` dans `css/utilities.css`**

Ajouter à la fin du fichier :

```css

/* ==========================================================================
   TRAME DEMI-TEINTE PARTAGÉE — PORTRAIT, VIGNETTES PROJETS, MODALE PROJET
   ==========================================================================
   Conteneur à poser autour d'un <img> : le N&B + la trame de points restent
   permanents (pas de réapparition de couleur au survol), cohérent avec la
   direction "Le Journal".
*/
.halftone-frame {
    position: relative;
    overflow: hidden;
    display: block;
}

.halftone-frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    filter: grayscale(1) contrast(1.08);
}

.halftone-frame::after {
    content: "";
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(17, 17, 17, .55) 1px, transparent 1.3px);
    background-size: 4px 4px;
    mix-blend-mode: multiply;
    opacity: .35;
    pointer-events: none;
}
```

- [ ] **Step 4: Build et vérification**

```bash
npm run build:css
node --check js/app.js
```
Attendu : les deux commandes se terminent sans erreur. Ouvrir `index.html` dans un navigateur, confirmer que le fond de page est un blanc légèrement chaud (pas de régression visuelle flagrante — le reste des sections n'est pas encore modifié, c'est normal).

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.js css/style.css css/utilities.css
git commit -m "style: swap paper tokens to warm journal white, add shared halftone-frame"
```

---

### Task 2: Navigation → Masthead

**Files:**
- Modify: `index.html:83-225` (nav + menu mobile overlay)
- Modify: `css/components.css` (ajout section masthead)
- Modify: `js/app.js:187-216` (`renderHero` — mise à jour `nav-logo`), `js/app.js:603-614` (effet shrink navbar)

**Interfaces:**
- Consumes: rien de nouveau (réutilise `.tag-bracket` de la loi existante si besoin).
- Produces: classe CSS `.dateline-row` + `.navbar-scrolled` (mécanisme de rétrécissement du masthead au scroll) — usage interne à cette tâche uniquement.

- [ ] **Step 1: Remplacer le nav + l'overlay mobile dans `index.html`**

Remplacer tout le bloc de la ligne 83 (`<!-- ... 1. BARRE DE NAVIGATION ... -->`) à la ligne 225 (`</div>` de fermeture de `mobile-nav-overlay`) par :

```html
    <!-- 
         ==========================================================================
         1. MASTHEAD (DATELINE + NOM DU JOURNAL + NAVIGATION)
         ==========================================================================
         - 'id="navbar"' est utilisé en JS pour l'effet de rétrécissement au scroll.
         - Le bouton 'id="cv-btn"' ouvre automatiquement le CV interactif.
    -->
    <nav
      class="docked full-width top-0 sticky z-50 bg-background transition-all duration-300"
      id="navbar"
    >
      <div class="dateline-row border-b border-on-surface/20">
        <div class="flex justify-between items-center px-gutter md:px-lg max-w-container-max mx-auto py-1.5 font-label-sm text-[10px] uppercase tracking-[0.14em] text-on-surface-variant">
          <span>Édition numérique — Nº 001</span>
          <span class="hidden sm:inline">Disponible pour un stage ou une alternance</span>
        </div>
      </div>
      <div
        class="flex justify-between items-center w-full px-gutter md:px-lg max-w-container-max mx-auto py-4 border-b-2 border-on-surface"
      >
        <!-- Nom du journal / nameplate -->
        <a
          class="font-display-lg text-lg md:text-xl font-black tracking-tight text-on-surface"
          href="#hero"
          id="nav-logo"
        >
          Le Journal de Jordan
        </a>

        <!-- Liens de navigation pour les ordinateurs (Desktop Menu) -->
        <ul class="hidden md:flex items-center">
          <li class="border-l border-on-surface">
            <a
              class="font-label-sm text-[11px] uppercase tracking-[0.08em] text-on-surface-variant hover:text-secondary transition-colors duration-300 nav-link px-4"
              href="#about"
              >02 — À Propos</a
            >
          </li>
          <li class="border-l border-on-surface">
            <a
              class="font-label-sm text-[11px] uppercase tracking-[0.08em] text-on-surface-variant hover:text-secondary transition-colors duration-300 nav-link px-4"
              href="#skills"
              >03 — Compétences</a
            >
          </li>
          <li class="border-l border-on-surface">
            <a
              class="font-label-sm text-[11px] uppercase tracking-[0.08em] text-on-surface-variant hover:text-secondary transition-colors duration-300 nav-link px-4"
              href="#projects"
              >04 — Projets</a
            >
          </li>
          <!--
               DESACTIVÉ : Lien vers la section Parcours.
               Pour le réactiver, supprimez simplement les balises de début et de fin de commentaire ci-dessous.
          <li class="border-l border-on-surface">
            <a
              class="font-label-sm text-[11px] uppercase tracking-[0.08em] text-on-surface-variant hover:text-secondary transition-colors duration-300 nav-link px-4"
              href="#experience"
              >Parcours</a
            >
          </li>
          -->
          <li class="border-l border-r border-on-surface">
            <a
              class="font-label-sm text-[11px] uppercase tracking-[0.08em] text-on-surface-variant hover:text-secondary transition-colors duration-300 nav-link px-4"
              href="#contact"
              >05 — Contact</a
            >
          </li>
        </ul>

        <!-- Zone d'action de droite (Bouton CV & Menu Mobile) -->
        <div class="nav-actions flex items-center gap-4">
          <!-- IMPORTANT : Conservez id="cv-btn" pour que le clic déclenche le CV popup dans app.js -->
          <a
            class="hidden md:inline-flex border border-on-surface hover:border-secondary hover:text-secondary text-on-surface px-md py-xs font-label-sm text-[11px] uppercase tracking-wide transition-all duration-200 cursor-pointer"
            id="cv-btn"
            >Mon CV</a
          >

          <!-- Bouton Menu Burger - Visible uniquement sur smartphones et tablettes -->
          <button
            class="md:hidden text-on-surface w-10 h-10 border border-on-surface flex items-center justify-center"
            id="menu-toggle"
            aria-label="Menu Mobile"
          >
            <span class="material-symbols-outlined text-2xl">menu</span>
          </button>
        </div>
      </div>

      <!-- Ligne de progression de lecture (gérée en JS) -->
      <div class="scroll-progress-bar" id="scroll-progress"></div>
    </nav>

    <!-- 
         ==========================================================================
         MENU MOBILE PLEIN ÉCRAN (OVERLAY)
         ==========================================================================
         S'affiche en plein écran lors du clic sur le menu burger (mobile).
         - 'id="mobile-nav-overlay"' est requis pour les écouteurs d'événements JS.
    -->
    <div class="mobile-nav-overlay" id="mobile-nav-overlay">
      <ul class="flex flex-col gap-6 items-center text-center">
        <li>
          <a
            class="mobile-nav-link text-xl font-bold font-display-lg"
            href="#about"
            >02 — À Propos</a
          >
        </li>
        <li>
          <a
            class="mobile-nav-link text-xl font-bold font-display-lg"
            href="#skills"
            >03 — Compétences</a
          >
        </li>
        <li>
          <a
            class="mobile-nav-link text-xl font-bold font-display-lg"
            href="#projects"
            >04 — Projets</a
          >
        </li>
        <!--
             DESACTIVÉ : Lien vers la section Parcours.
             Pour le réactiver, supprimez simplement les balises de début et de fin de commentaire ci-dessous.
        <li>
          <a
            class="mobile-nav-link text-xl font-bold font-display-lg"
            href="#experience"
            >Parcours</a
          >
        </li>
        -->
        <li>
          <a
            class="mobile-nav-link text-xl font-bold font-display-lg"
            href="#contact"
            >05 — Contact</a
          >
        </li>
      </ul>
    </div>
```

- [ ] **Step 2: Ajouter les styles du masthead dans `css/components.css`**

Ajouter à la fin du fichier :

```css

/* ==========================================================================
   11. MASTHEAD — DATELINE RÉTRACTABLE AU SCROLL
   ========================================================================== */

.dateline-row {
    max-height: 40px;
    overflow: hidden;
    transition: max-height 0.3s ease, opacity 0.2s ease;
}

.navbar-scrolled .dateline-row {
    max-height: 0;
    opacity: 0;
}
```

- [ ] **Step 3: Mettre à jour `renderHero()` pour le nouveau nameplate**

Dans `js/app.js`, remplacer (lignes 209-212) :

```javascript
        const logoEl = document.getElementById('nav-logo');
        if (logoEl) {
            logoEl.innerHTML = `${h.name} Portfolio<span class="w-2 h-2 rounded-full bg-secondary inline-block ml-1"></span>`;
        }
```

par :

```javascript
        const logoEl = document.getElementById('nav-logo');
        if (logoEl) logoEl.textContent = `Le Journal de ${h.name}`;
```

- [ ] **Step 4: Remplacer l'effet de rétrécissement de la navbar au scroll**

Dans `js/app.js`, section "10. EFFET SHRINK DE LA NAVBAR AU SCROLL", remplacer (lignes 603-614) :

```javascript
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 40) {
                navbar.classList.add('shadow-md', 'h-16');
                navbar.classList.remove('h-20');
            } else {
                navbar.classList.remove('shadow-md', 'h-16');
                navbar.classList.add('h-20');
            }
        });
    }
```

par :

```javascript
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('navbar-scrolled', window.scrollY > 40);
        });
    }
```

- [ ] **Step 5: Build et vérification**

```bash
npm run build:css
node --check js/app.js
```
Ouvrir `index.html` dans un navigateur : le masthead affiche la ligne de dateline puis "Le Journal de Jordan" (nom réel chargé depuis les données), les liens numérotés séparés par des filets verticaux. Scroller de plus de 40px : la ligne de dateline se rétracte proprement (pas de saut de layout). Cliquer sur le bouton burger en largeur mobile (redimensionner la fenêtre) : l'overlay s'ouvre/se ferme normalement.

- [ ] **Step 6: Commit**

```bash
git add index.html css/components.css js/app.js
git commit -m "feat(nav): rebuild navigation as broadsheet masthead with dateline"
```

---

### Task 3: Hero → article de une

**Files:**
- Modify: `index.html:238-311` (section `#hero`)
- Modify: `css/components.css` (ajout mise en page éditoriale)
- Modify: `js/app.js:187-216` (`renderHero` — ajout byline + légende)

**Interfaces:**
- Consumes: `.halftone-frame` (Task 1).
- Produces: classes CSS `.article-columns` (colonnes de texte réutilisables) et `.drop-cap` (lettrine) — consommées par Task 4 (À propos, `.article-columns` seul) et Task 7 (modale projet, `.article-columns` seul).

- [ ] **Step 1: Remplacer la section Hero dans `index.html`**

Remplacer tout le bloc de la ligne 238 (`<section ... id="hero">`) à la ligne 311 (`</section>`) par :

```html
      <section
        class="relative pt-lg pb-xl px-gutter max-w-container-max mx-auto overflow-hidden border-b-4 border-double border-on-surface"
        id="hero"
      >
        <div class="grid md:grid-cols-2 gap-xl items-start w-full">
          <!-- Colonne de gauche : article principal -->
          <div class="flex flex-col gap-md reveal">
            <span class="font-label-sm text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Une — Portrait</span>

            <!-- Grand titre d'accroche visuelle -->
            <h1
              class="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface"
              id="hero-title"
            >
              Concevoir l'Avenir,<br />
              <span
                class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"
                >Une Ligne de Code à la Fois.</span
              >
            </h1>

            <!-- Byline générée depuis hero.name + hero.role -->
            <p
              class="font-label-sm text-[11px] uppercase tracking-[0.06em] text-on-surface-variant border-b border-on-surface pb-3"
              id="hero-byline"
            >
              <!-- Rempli dynamiquement par renderHero() -->
            </p>

            <!-- Statut de disponibilité -->
            <div class="inline-flex items-center gap-2 w-fit">
              <span class="status-dot"></span>
              <span
                class="font-label-sm text-[11px] uppercase tracking-wide text-on-surface-variant"
                id="hero-availability"
                >Disponible pour un stage</span
              >
            </div>

            <!-- Description courte, en colonnes avec lettrine -->
            <p
              class="article-columns drop-cap font-body-lg text-body-lg text-on-surface-variant dark:text-on-surface/80"
              id="hero-description"
            >
              Étudiant passionné en Génie Informatique, IA et Data-science
              . Je combine logique technique et créativité
              pour créer des expériences marquantes.
            </p>

            <!-- Liens d'actions rapides (CTA) -->
            <div class="flex flex-wrap gap-sm mt-sm">
              <a
                class="inline-flex items-center justify-center bg-primary hover:bg-primary-container text-white px-lg py-sm font-label-sm text-label-sm uppercase tracking-wide transition-all duration-300"
                href="#projects"
                >Mes Projets →</a
              >
              <a
                class="inline-flex items-center justify-center border-2 border-primary text-primary hover:bg-primary/5 px-lg py-sm font-label-sm text-label-sm uppercase tracking-wide transition-all duration-300"
                href="#contact"
                >Contact</a
              >
            </div>
          </div>

          <!-- Colonne de droite : photo en trame demi-teinte + légende + tags -->
          <div
            class="flex flex-col items-center md:items-end gap-3 reveal delay-200"
          >
            <div class="halftone-frame w-64 h-64 md:w-80 md:h-96 border-2 border-on-surface">
              <img
                alt="Portrait de l'étudiant"
                id="hero-img"
                src="images/jordan-portrait.jpg"
              />
            </div>
            <p
              class="font-body-lg text-[11px] italic text-on-surface-variant text-center md:text-right max-w-[20rem]"
              id="hero-caption"
            >
              <!-- Rempli dynamiquement par renderHero() -->
            </p>
            <div class="flex gap-4">
              <span class="tag-bracket" id="hero-badge-1">Développeur Web</span>
              <span class="tag-bracket" id="hero-badge-2">Développeur Mobile</span>
            </div>
          </div>
        </div>
      </section>
```

- [ ] **Step 2: Ajouter la mise en page éditoriale (colonnes + lettrine) dans `css/components.css`**

Ajouter à la fin du fichier :

```css

/* ==========================================================================
   12. MISE EN PAGE ÉDITORIALE — COLONNES DE TEXTE & LETTRINE
   ==========================================================================
   Réutilisé par le Hero, la section À propos et la modale de détail projet.
*/

.article-columns {
    column-count: 2;
    column-gap: 24px;
}

.drop-cap::first-letter {
    font-family: 'Fraunces', serif;
    font-size: 3.2em;
    font-weight: 800;
    float: left;
    line-height: .82;
    padding-right: 8px;
}

@media (max-width: 860px) {
    .article-columns {
        column-count: 1;
    }
}
```

- [ ] **Step 3: Ajouter la byline et la légende dans `renderHero()`**

Dans `js/app.js`, dans la fonction `renderHero`, juste après le bloc `badge2El` (après la ligne `if (badge2El && h.badges) badge2El.textContent = h.badges[1] || '';`), ajouter :

```javascript
        const bylineEl = document.getElementById('hero-byline');
        if (bylineEl) bylineEl.textContent = `Par ${h.name} — ${h.role || ''}`;

        const captionEl = document.getElementById('hero-caption');
        if (captionEl) captionEl.textContent = `— ${h.name}, photographié pour cette édition.`;
```

- [ ] **Step 4: Build et vérification**

```bash
npm run build:css
node --check js/app.js
```
Ouvrir `index.html` : le portrait apparaît en N&B avec une trame de points visible, la description du Hero se répartit sur deux colonnes avec une lettrine sur la première lettre, la byline affiche "Par Jordan — Développeur Full-Stack" (ou le nom/rôle réels des données), la légende sous la photo est présente. Réduire la largeur de la fenêtre sous ~860px : les colonnes repassent à une seule colonne.

- [ ] **Step 5: Commit**

```bash
git add index.html css/components.css js/app.js
git commit -m "feat(hero): rebuild hero as front-page article with byline and halftone portrait"
```

---

### Task 4: À propos → rubriques + notices

**Files:**
- Modify: `index.html:325-431` (section `#about`)
- Modify: `js/app.js:218-259` (`renderAbout`), `js/app.js:625-638` (bascule d'onglets)

**Interfaces:**
- Consumes: `.article-columns` (Task 3), `.grayscale-emoji` (fondation déjà existante), `.tab-btn`/`.tab-btn.active` (CSS déjà existant dans `css/components.css:14-28` — transparent + soulignement accent au clic, aucune modification CSS nécessaire, seules les classes Tailwind sur les boutons HTML changent).

- [ ] **Step 1: Remplacer la section À propos dans `index.html`**

Remplacer tout le bloc de la ligne 325 (`<section ... id="about">`) à la ligne 431 (`</section>`) par :

```html
      <section class="py-xl px-gutter max-w-container-max mx-auto" id="about">
        <div class="flex flex-col items-center text-center mb-lg reveal">
          <h2 class="font-headline-md text-headline-md text-on-surface mb-xs">
            À Propos de Moi
          </h2>
          <p
            class="font-body-md text-body-md text-on-surface-variant max-w-2xl"
          >
            Découvrez mon parcours, mes passions et ma vision de l'ingénierie
            logicielle.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-md items-start">
          <!-- Volet Gauche : Votre histoire professionnelle -->
          <div class="flex flex-col gap-6 reveal">
            <h3
              class="font-headline-md text-xl font-bold text-on-surface"
              id="about-story-title"
            >
              Créer avec Code & Innovation.
            </h3>
            <div id="about-paragraphs" class="article-columns">
              <p class="font-body-lg text-body-md text-on-surface-variant">
                Actuellement étudiant en informatique plus précisément en Génie Logiciel, j'ai développé une passion
                profonde pour le développement web full-stack, l'intelligence artificielle et la data science.
              </p>
              <p class="font-body-lg text-body-md text-on-surface-variant">
                Je m'attache à réduire le fossé entre la rigueur de l'ingénierie logicielle et l'élégance d'un design visuel moderne et soigné.
                Pour moi, le code doit être aussi fluide, intuitif et harmonieux que le monde qui nous entoure.
                En combinant mes compétences techniques à la puissance des outils d'intelligence artificielle, je souhaite concevoir des applications innovantes, performantes et centrées sur l'expérience utilisateur.
              </p>
            </div>
            <div class="mt-2">
              <a
                class="inline-flex bg-primary hover:bg-primary-container text-white px-md py-xs font-label-sm text-label-sm transition-all duration-300"
                href="#skills"
                >Découvrir mes compétences</a
              >
            </div>
          </div>

          <!-- Volet Droit : Rubriques interactives -->
          <div class="glass-card p-6 reveal delay-200">
            <!-- Sélecteur de rubrique (Bouton actif = classe 'active', voir components.css) -->
            <div
              class="flex gap-4 border-b border-on-surface pb-3 mb-4"
            >
              <!-- Rubrique Histoire -->
              <button
                class="tab-btn active font-label-sm text-[11px] uppercase tracking-[0.06em] text-on-surface-variant pb-2 border-b-2 border-transparent"
                data-tab="journey"
              >
                Parcours
              </button>
              <!-- Rubrique Études -->
              <button
                class="tab-btn font-label-sm text-[11px] uppercase tracking-[0.06em] text-on-surface-variant pb-2 border-b-2 border-transparent"
                data-tab="edu"
              >
                Formation
              </button>
              <!-- Rubrique Valeurs -->
              <button
                class="tab-btn font-label-sm text-[11px] uppercase tracking-[0.06em] text-on-surface-variant pb-2 border-b-2 border-transparent"
                data-tab="core"
              >
                Valeurs
              </button>
            </div>

            <!-- CONTENU DE LA RUBRIQUE 1 : Parcours (Actif par défaut) -->
            <div class="tab-content active" id="tab-journey">
              <p
                class="font-body-md text-sm text-on-surface-variant leading-relaxed mb-4"
                id="about-journey-1"
              >
                Passionné de nouvelles technologies depuis mon plus jeune âge,
                j'ai démarré le codage de petites applications avant de plonger
                dans l'écosystème web moderne avec React et Node.js.
              </p>
              <p
                class="font-body-md text-sm text-on-surface-variant leading-relaxed"
                id="about-journey-2"
              >
                Aujourd'hui, je crée des produits soignés en m'assurant que
                chaque animation et interaction apporte une réelle plus-value à
                l'expérience de l'utilisateur final.
              </p>
            </div>

            <!-- CONTENU DE LA RUBRIQUE 2 : Formation -->
            <div class="tab-content" id="tab-edu">
              <div class="flex flex-col gap-3" id="about-education-container">
                <!-- Rempli dynamiquement -->
              </div>
            </div>

            <!-- CONTENU DE LA RUBRIQUE 3 : Valeurs -->
            <div class="tab-content" id="tab-core">
              <ul class="flex flex-col gap-3 text-sm text-on-surface-variant" id="about-values-container">
                <!-- Rempli dynamiquement -->
              </ul>
            </div>
          </div>
        </div>
      </section>
```

- [ ] **Step 2: Mettre à jour `renderAbout()` — notices d'éducation et encadrés de valeurs**

Dans `js/app.js`, remplacer le bloc `eduContainer` (lignes 238-249) :

```javascript
        const eduContainer = document.getElementById('about-education-container');
        if (eduContainer && a.education) {
            eduContainer.innerHTML = a.education.map(e => `
                <div class="border-b border-on-surface/15 pb-3 last:border-b-0 last:pb-0">
                  <span class="font-label-sm text-[10px] uppercase tracking-[0.06em] text-on-surface-variant">${e.dates}</span>
                  <h4 class="font-headline-md text-sm font-bold text-on-surface mt-0.5">${e.degree}</h4>
                  <p class="text-xs font-semibold text-on-surface-variant mb-1">${e.school}</p>
                  <p class="text-xs text-on-surface-variant">${e.desc}</p>
                </div>
            `).join('');
        }
```

Remplacer le bloc `valuesContainer` (lignes 251-258) :

```javascript
        const valuesContainer = document.getElementById('about-values-container');
        if (valuesContainer && a.values) {
            valuesContainer.innerHTML = a.values.map(v => `
                <li class="border border-on-surface p-3 flex flex-col gap-1">
                  <span class="grayscale-emoji text-lg">${v.emoji || '🚀'}</span>
                  <strong class="font-headline-md text-sm text-on-surface">${v.title}</strong>
                  <span class="text-xs text-on-surface-variant">${v.desc}</span>
                </li>
            `).join('');
        }
```

- [ ] **Step 3: Simplifier la bascule de rubriques**

Dans `js/app.js`, section "11. ONGLETS DE PRÉSENTATION INTERACTIFS", remplacer (lignes 625-638) :

```javascript
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');

            // Désactive tous les boutons d'onglets et les contenus
            tabButtons.forEach(btn => btn.classList.remove('active', 'bg-surface-container-high'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Active uniquement l'onglet cliqué
            button.classList.add('active', 'bg-surface-container-high');
            const targetContent = document.getElementById(`tab-${tabName}`);
            if (targetContent) targetContent.classList.add('active');
        });
    });
```

par :

```javascript
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');

            // Désactive tous les boutons de rubrique et les contenus
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Active uniquement la rubrique cliquée
            button.classList.add('active');
            const targetContent = document.getElementById(`tab-${tabName}`);
            if (targetContent) targetContent.classList.add('active');
        });
    });
```

- [ ] **Step 4: Build et vérification**

```bash
npm run build:css
node --check js/app.js
```
Ouvrir `index.html`, aller à la section À propos : les paragraphes s'affichent en deux colonnes, les 3 rubriques (Parcours/Formation/Valeurs) se comportent comme avant (clic → changement de contenu) mais avec un soulignement rouge sur la rubrique active au lieu d'un fond plein. Vérifier que la rubrique "Formation" affiche les notices avec date en petites capitales, et que "Valeurs" affiche 4 encadrés avec emoji en niveaux de gris.

- [ ] **Step 5: Commit**

```bash
git add index.html js/app.js
git commit -m "feat(about): restyle tabs as rubriques and rewrite education/values templates"
```

---

### Task 5: Compétences → barres fines

**Files:**
- Modify: `index.html` (aucun changement de structure statique nécessaire — le conteneur `#skills-categories-container` reste identique)
- Modify: `js/app.js:261-293` (`renderSkills`)

**Interfaces:**
- Consumes: rien de nouveau.

- [ ] **Step 1: Réécrire le template de `renderSkills()`**

Dans `js/app.js`, remplacer toute la fonction `renderSkills` (lignes 261-293) :

```javascript
    const renderSkills = () => {
        const container = document.getElementById('skills-categories-container');
        if (!container || !PORTFOLIO_DATA.skills) return;

        container.innerHTML = PORTFOLIO_DATA.skills.map((cat, catIdx) => {
            const skillItemsHtml = cat.items.map(item => `
                <div class="flex flex-col gap-1">
                  <div class="flex justify-between font-label-sm text-[11px] text-on-surface-variant">
                    <span>${item.name}</span>
                    <span class="tabular-nums">${item.percent}%</span>
                  </div>
                  <div class="w-full h-0.5 bg-on-surface/10 overflow-hidden">
                    <div class="h-full bg-on-surface skill-bar-fill" style="width: 0%;" data-percent="${item.percent}"></div>
                  </div>
                </div>
            `).join('');

            return `
                <div class="glass-card p-6 reveal delay-${catIdx * 100} flex flex-col gap-6 border-t-2 border-on-surface">
                  <div class="flex items-center gap-3 border-b border-on-surface/20 pb-3">
                    <span class="material-symbols-outlined text-on-surface text-xl">${cat.icon || 'star'}</span>
                    <h3 class="font-label-sm text-[11px] uppercase tracking-[0.08em] text-on-surface">${cat.category}</h3>
                  </div>
                  <div class="flex flex-col gap-4">
                    ${skillItemsHtml}
                  </div>
                </div>
            `;
        }).join('');

        // Animation des jauges
        triggerSkillsAnimation();
    };
```

- [ ] **Step 2: Build et vérification**

```bash
npm run build:css
node --check js/app.js
```
Ouvrir `index.html`, section Compétences : 3 catégories avec en-tête en petites capitales, barres fines noires (piste grise, remplissage noir plein), toujours animées au scroll (vérifier que les barres se remplissent en défilant jusqu'à la section).

- [ ] **Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat(skills): restyle bars as thin monochrome gauges with editorial headers"
```

---

### Task 6: Projets → grille de brèves + filtre

**Files:**
- Modify: `index.html:486-532` (filtres + conteneur `#projects-grid`)
- Modify: `js/app.js:295-367` (`renderProjects`), `js/app.js:679-717` (filtrage)

**Interfaces:**
- Consumes: `.halftone-frame` (Task 1), `.filter-btn`/`.filter-btn.active` (fondation déjà existante), `.tag-bracket` (fondation déjà existante).

- [ ] **Step 1: Remplacer les filtres et le conteneur dans `index.html`**

Remplacer le bloc de la ligne 486 (`<section ... id="projects">`) à la ligne 532 (`</section>`) par :

```html
      <section
        class="py-xl px-gutter max-w-container-max mx-auto border-t-4 border-double border-on-surface"
        id="projects"
      >
        <div class="flex flex-col items-center text-center mb-lg reveal">
          <h2 class="font-headline-md text-headline-md text-on-surface mb-xs">
            Mes Projets Récents
          </h2>
          <p
            class="font-body-md text-body-md text-on-surface-variant max-w-2xl"
          >
            Une sélection de mes travaux académiques et personnels, démontrant
            mes compétences en développement full-stack et en conception
            d'interfaces.
          </p>
        </div>

        <!-- Boutons de filtrage dynamiques (chaque bouton possède un attribut 'data-filter') -->
        <div class="flex justify-center gap-sm mb-lg flex-wrap reveal">
          <button class="filter-btn active" data-filter="all">Tout</button>
          <button class="filter-btn" data-filter="web">Web Advanced</button>
          <button class="filter-btn" data-filter="mobile">Applications Mobiles</button>
        </div>

        <!-- Grille de brèves -->
        <div
          class="grid grid-cols-1 md:grid-cols-2 gap-x-md gap-y-lg"
          id="projects-grid"
        >
          <!-- Les brèves de projets seront injectées dynamiquement par JS -->
        </div>
      </section>
```

- [ ] **Step 2: Réécrire le template de `renderProjects()`**

Dans `js/app.js`, remplacer toute la fonction `renderProjects` (lignes 295-367) :

```javascript
    const renderProjects = () => {
        const grid = document.getElementById('projects-grid');
        if (!grid || !PORTFOLIO_DATA.projects) return;

        grid.innerHTML = PORTFOLIO_DATA.projects.map((proj, projIdx) => `
          <div
            class="project-card border-t-2 border-on-surface pt-4 flex flex-col gap-3 reveal delay-${(projIdx % 3) * 100} cursor-pointer"
            data-category="${proj.category}"
            data-project-id="${proj.id}"
          >
            <div class="halftone-frame h-40 w-full">
              <img alt="${proj.cardTitle}" src="${proj.image}" />
            </div>
            <span class="font-label-sm text-[10px] uppercase tracking-[0.08em] text-accent">${proj.categoryLabel}</span>
            <h3 class="font-headline-md text-lg font-bold text-on-surface project-title">${proj.cardTitle}</h3>
            <p class="font-body-md text-sm text-on-surface-variant">${proj.shortDescription}</p>
            <div class="flex flex-wrap gap-2 mt-auto pt-2 border-t border-on-surface/15">
              ${proj.tech.slice(0, 3).map(t => `<span class="tag-bracket">${t}</span>`).join('')}
            </div>
          </div>
        `).join('');

        // Attache les événements de clic sur les nouvelles brèves de projets
        document.querySelectorAll('#projects-grid .project-card').forEach(card => {
            card.addEventListener('click', () => {
                const projectId = card.getAttribute('data-project-id');
                if (projectId) openProjectModal(projectId);
            });
        });
    };
```

- [ ] **Step 3: Simplifier le filtrage**

Dans `js/app.js`, section "13. FILTRAGE DE LA GRILLE DE PROJETS", remplacer (lignes 686-694) :

```javascript
            // Réinitialise l'état actif de tous les boutons de filtrage
            filterButtons.forEach(btn => {
                btn.classList.remove('active', 'bg-primary', 'text-white');
                btn.classList.add('text-on-surface-variant');
            });
            
            // Active visuellement le bouton cliqué
            button.classList.add('active', 'bg-primary', 'text-white');
            button.classList.remove('text-on-surface-variant');
```

par :

```javascript
            // Réinitialise l'état actif de tous les boutons de filtrage
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Active visuellement le bouton cliqué
            button.classList.add('active');
```

Le reste de la fonction de filtrage (bascule `card.style.display`/opacité/transform, lignes 696-715) reste inchangé — il fonctionne déjà correctement avec des cartes uniformes.

- [ ] **Step 4: Build et vérification**

```bash
npm run build:css
node --check js/app.js
```
Ouvrir `index.html`, section Projets : grille de 2 colonnes, chaque brève avec filet supérieur, vignette en N&B/trame, catégorie en rouge, titre, description, tags entre crochets. Cliquer sur les filtres "Web Advanced"/"Applications Mobiles" : les cartes correspondantes s'affichent/masquent sans déformation. Cliquer sur une brève : la modale de détail s'ouvre (le contenu de la modale sera retravaillé à la Task 7, il peut sembler non stylé jusque-là).

- [ ] **Step 5: Commit**

```bash
git add index.html js/app.js
git commit -m "feat(projects): rebuild grid as uniform briefs with halftone thumbnails"
```

---

### Task 7: Modale de détail projet → page d'article

**Files:**
- Modify: `js/app.js:114-167` (`openProjectModal`)

**Interfaces:**
- Consumes: `.halftone-frame` (Task 1), `.article-columns` (Task 3).

- [ ] **Step 1: Réécrire le template de `openProjectModal()`**

Dans `js/app.js`, remplacer le corps de la fonction `openProjectModal` de la ligne 114 à la ligne 167 (en gardant la signature et l'activation de la modale identiques) :

```javascript
    const openProjectModal = (projectId) => {
        const data = PROJECTS_DATA[projectId];
        if (!data || !projectModal || !projectModalContent) return;

        // Génération dynamique de la liste des fonctionnalités clés
        const featuresList = data.features.map(f =>
            `<li class="flex items-start gap-2 text-sm text-on-surface-variant">
                <span class="text-on-surface mt-0.5">—</span>
                <span>${f}</span>
            </li>`
        ).join('');

        // Injection de la structure HTML complète du projet dans la modale
        projectModalContent.innerHTML = `
            <div class="flex flex-col gap-6">
                <!-- Zone d'image du projet, en trame demi-teinte -->
                <div class="halftone-frame h-48 md:h-64 w-full">
                    <img src="${data.image}" alt="${data.title}">
                </div>
                <!-- Titre et ligne de byline (catégorie · stack) -->
                <div class="flex flex-col gap-2 border-b-2 border-double border-on-surface pb-4">
                    <h2 class="font-display-lg text-2xl md:text-headline-md text-on-surface font-extrabold">${data.title}</h2>
                    <p class="font-label-sm text-[11px] uppercase tracking-[0.06em] text-on-surface-variant">${data.categoryLabel} · ${data.tech.join(', ')}</p>
                </div>
                <!-- Description complète, en colonnes -->
                <div class="article-columns font-body-md text-sm text-on-surface-variant leading-relaxed">
                    ${data.description}
                </div>
                <!-- Encadré "En bref" -->
                <div class="border border-on-surface p-4 flex flex-col gap-3">
                    <h4 class="font-label-sm text-[11px] uppercase tracking-[0.08em] text-on-surface">En bref</h4>
                    <ul class="flex flex-col gap-2">${featuresList}</ul>
                </div>
                <!-- Liens d'actions (Démo / Code) -->
                <div class="flex gap-6 border-t border-on-surface/20 pt-4">
                    ${data.demo !== '#' ? `<a href="${data.demo}" target="_blank" class="font-label-sm text-[11px] uppercase tracking-wide text-on-surface underline underline-offset-4 hover:text-accent">Visiter le site</a>` : ''}
                    ${data.source !== '#' ? `<a href="${data.source}" target="_blank" class="font-label-sm text-[11px] uppercase tracking-wide text-on-surface underline underline-offset-4 hover:text-accent">Code source</a>` : ''}
                </div>
            </div>
        `;

        // Activation visuelle de la modale (CSS transition opacity)
        projectModal.classList.add('active');
        projectModal.setAttribute('aria-hidden', 'false');
        // Verrouille le défilement de la page arrière-plan pour améliorer l'expérience utilisateur (UX)
        document.body.style.overflow = 'hidden';
    };
```

- [ ] **Step 2: Build et vérification**

```bash
npm run build:css
node --check js/app.js
```
Ouvrir `index.html`, cliquer sur une brève de projet : la modale affiche l'image en N&B/trame, le titre en gros serif, la ligne de byline catégorie/stack, la description en deux colonnes, l'encadré "En bref" avec la liste des fonctionnalités, et les liens Démo/Code en liens soulignés (vérifier qu'un projet avec `demo: "#"` n'affiche pas de lien Démo, cf. `tracabilite-agricole` a un vrai lien source GitHub — vérifier son affichage). Le bouton `#close-project-modal` continue de fermer la modale normalement.

- [ ] **Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat(project-modal): rebuild detail modal as full article layout"
```

---

### Task 8: Contact + Footer → petites annonces + colophon

**Files:**
- Modify: `index.html:658-898` (section `#contact` + `<footer>`)
- Modify: `css/components.css:68-80` (`.form-input:focus`)
- Modify: `js/app.js:369-395` (`renderContact`)

**Interfaces:**
- Consumes: `.tag-bracket` (fondation déjà existante).

- [ ] **Step 1: Remplacer la section Contact et le Footer dans `index.html`**

Remplacer le bloc de la ligne 658 (`<section ... id="contact">`) à la ligne 898 (`</footer>`) par :

```html
      <section class="py-xl px-gutter max-w-container-max mx-auto border-t-4 border-double border-on-surface" id="contact">
        <div class="flex flex-col items-center text-center mb-lg reveal">
          <h2 class="font-headline-md text-headline-md text-on-surface mb-xs">
            Me Contacter
          </h2>
          <p
            class="font-body-md text-body-md text-on-surface-variant max-w-2xl"
          >
            Une idée de projet, une offre de stage ou simplement une question ?
            Discutons-en ensemble !
          </p>
        </div>

        <div
          class="grid grid-cols-1 md:grid-cols-12 gap-md items-start max-w-5xl mx-auto"
        >
          <!-- Bloc de gauche : Petites annonces -->
          <div class="md:col-span-5 flex flex-col gap-3 reveal border border-on-surface p-6">
            <span class="font-label-sm text-[10px] uppercase tracking-[0.1em] text-accent">Petites annonces</span>
            <div class="flex flex-col gap-3 border-t border-on-surface/20 pt-3">
              <div>
                <div class="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant">Email —</div>
                <a
                  href="mailto: jdibangoup5@gmail.com"
                  class="text-sm font-bold text-on-surface hover:text-accent transition-all"
                  id="contact-email-link"
                  >jdibangoup5@gmail.com</a
                >
              </div>
              <div>
                <div class="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant">Localisation —</div>
                <div class="text-sm font-bold text-on-surface" id="contact-location-text">
                  Abidjan, Côte d'Ivoire
                </div>
              </div>
              <div>
                <div class="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">Me suivre —</div>
                <div class="flex gap-4">
                  <a class="tag-bracket" href="#" id="contact-github-link" aria-label="GitHub">github</a>
                  <a class="tag-bracket" href="#" id="contact-linkedin-link" aria-label="LinkedIn">linkedin</a>
                </div>
              </div>
            </div>
          </div>

          <!-- Bloc de droite : Formulaire de contact -->
          <div class="md:col-span-7 reveal delay-200">
            <!-- IMPORTANT : Conservez les id sur les inputs, ils sont ciblés en JavaScript dans app.js -->
            <form class="flex flex-col gap-5" id="contact-form" action="https://api.web3forms.com/submit" method="POST">
              <input type="hidden" name="access_key" value="1e96af0c-37e9-4900-95ab-3413ff598fd2">
              <div class="flex flex-col gap-1">
                <label for="form-name" class="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant">Nom complet *</label>
                <input
                  class="w-full py-2 text-sm bg-transparent border-0 border-b border-on-surface text-on-background outline-none form-input"
                  type="text"
                  id="form-name"
                  name="name"
                  placeholder="Votre nom"
                  required
                />
              </div>
              <div class="flex flex-col gap-1">
                <label for="form-email" class="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant">Adresse e-mail *</label>
                <input
                  class="w-full py-2 text-sm bg-transparent border-0 border-b border-on-surface text-on-background outline-none form-input"
                  type="email"
                  id="form-email"
                  name="email"
                  placeholder="votre.email@exemple.com"
                  required
                />
              </div>
              <div class="flex flex-col gap-1">
                <label for="form-subject" class="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant">Sujet *</label>
                <input
                  class="w-full py-2 text-sm bg-transparent border-0 border-b border-on-surface text-on-background outline-none form-input"
                  type="text"
                  id="form-subject"
                  name="subject"
                  placeholder="Sujet de votre message"
                  required
                />
              </div>
              <div class="flex flex-col gap-1">
                <label for="form-message-text" class="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant">Votre message *</label>
                <textarea
                  class="w-full py-2 text-sm bg-transparent border-0 border-b border-on-surface text-on-background outline-none min-h-[100px] resize-y form-input"
                  id="form-message-text"
                  name="message"
                  placeholder="Dites-m'en plus sur votre projet..."
                  required
                ></textarea>
              </div>

              <button
                class="self-start font-label-sm text-[11px] uppercase tracking-wide text-on-surface font-bold underline underline-offset-4 hover:text-accent transition-all duration-300 mt-2"
                type="submit"
              >
                Envoyer le message →
              </button>

              <div class="hidden mt-2" id="form-message"></div>
            </form>
          </div>
        </div>
      </section>
    </main>

    <!-- 
         ==========================================================================
         8. PIED DE PAGE COMMUN (FOOTER / COLOPHON)
         ==========================================================================
    -->
    <footer
      class="full-width py-lg mt-xl border-t-4 border-double border-on-surface bg-background"
    >
      <div
        class="flex flex-col md:flex-row justify-between items-center px-gutter max-w-container-max mx-auto gap-md"
      >
        <div
          class="font-display-lg text-base font-black text-on-surface"
          id="footer-logo"
        >
          Le Journal de Jordan
        </div>
        <ul class="flex flex-wrap justify-center gap-md">
          <li>
            <a
              class="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant hover:text-accent transition-colors duration-300"
              href="#about"
              >À Propos</a
            >
          </li>
          <li>
            <a
              class="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant hover:text-accent transition-colors duration-300"
              href="#skills"
              >Compétences</a
            >
          </li>
          <li>
            <a
              class="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant hover:text-accent transition-colors duration-300"
              href="#projects"
              >Projets</a
            >
          </li>
          <li>
            <a
              class="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant hover:text-accent transition-colors duration-300"
              href="#contact"
              >Contact</a
            >
          </li>
        </ul>
        <div
          class="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant text-center md:text-right"
          id="footer-copyright"
        >
          Édition numérique · Nº 001
        </div>
      </div>
    </footer>
```

Remarque : le bloc `<footer>` était auparavant en dehors de `<main>` en tant que frère. Le remplacement ci-dessus réintroduit correctement la fermeture `</main>` avant `<footer>` (comme dans l'original) — vérifier après application que `</main>` n'apparaît qu'une seule fois dans le fichier.

- [ ] **Step 2: Retirer l'anneau de focus coloré des champs de formulaire**

Dans `css/components.css`, remplacer (lignes 72-80) :

```css
.form-input:focus {
    border-color: var(--ink) !important;
    box-shadow: 0 0 0 3px var(--accent-soft) !important;
}

html.dark .form-input:focus {
    border-color: #4f46e5 !important;
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.2) !important;
}
```

par :

```css
.form-input:focus {
    border-color: var(--accent) !important;
    box-shadow: none !important;
}

html.dark .form-input:focus {
    border-color: #4f46e5 !important;
    box-shadow: none !important;
}
```

- [ ] **Step 3: Mettre à jour `renderContact()` pour le nouveau footer**

Dans `js/app.js`, remplacer (lignes 388-394) :

```javascript
        const footerLogo = document.getElementById('footer-logo');
        if (footerLogo) footerLogo.textContent = `${PORTFOLIO_DATA.hero.name}Portfolio`;
        
        const footerCopyright = document.getElementById('footer-copyright');
        if (footerCopyright) {
            footerCopyright.textContent = `© 2026 ${PORTFOLIO_DATA.hero.name} Portfolio. Conçu avec Précision & Clarté.`;
        }
```

par :

```javascript
        const footerLogo = document.getElementById('footer-logo');
        if (footerLogo) footerLogo.textContent = `Le Journal de ${PORTFOLIO_DATA.hero.name}`;

        const footerCopyright = document.getElementById('footer-copyright');
        if (footerCopyright) {
            footerCopyright.textContent = `Édition numérique · Nº 001 · © 2026 ${PORTFOLIO_DATA.hero.name}`;
        }
```

- [ ] **Step 4: Build et vérification**

```bash
npm run build:css
node --check js/app.js
```
Ouvrir `index.html`, section Contact : le bloc de gauche affiche l'email/localisation/réseaux en rubrique "Petites annonces", les champs de formulaire sont soulignés (pas de fond ni de carte), le focus sur un champ passe le soulignement en rouge sans halo. Soumettre le formulaire (avec des champs vides) : le toast d'erreur s'affiche toujours normalement (comportement JS inchangé). Vérifier le footer : nameplate + liens + mention d'édition.

- [ ] **Step 5: Commit**

```bash
git add index.html css/components.css js/app.js
git commit -m "feat(contact): restyle as classified-ads block, editorial form fields, colophon footer"
```

---

### Task 9: Modale CV → dossier de presse + Toasts → dépêches

**Files:**
- Modify: `js/app.js:36-71` (`showToast`), `js/app.js:426-527` (`openCvModal`)
- Modify: `css/overlays.css:88-116` (`.toast`, `.toast.success/.error/.info`)

**Interfaces:**
- Consumes: `.tag-bracket` (fondation déjà existante).

- [ ] **Step 1: Réécrire `showToast()` en "dépêche"**

Dans `js/app.js`, remplacer la fonction `showToast` (lignes 37-71) :

```javascript
    const showToast = (message, type = 'info') => {
        if (!toastContainer) return;

        // Création de la carte de notification HTML
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const kicker = type === 'success' ? 'Dernière minute'
            : type === 'error' ? 'Erreur'
            : 'Info';

        // Structure interne de la notification "dépêche"
        toast.innerHTML = `
            <div class="flex flex-col gap-1">
                <span class="font-label-sm text-[10px] uppercase tracking-[0.08em] text-accent">${kicker}</span>
                <div class="text-sm font-semibold text-on-surface">${message}</div>
            </div>
        `;

        toastContainer.appendChild(toast);

        // Déclenche l'animation d'apparition en CSS avec un léger décalage
        setTimeout(() => {
            toast.classList.add('show');
        }, 50);

        // Auto-destruction propre après 4 secondes
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove(); // Supprime l'élément du DOM après la transition de sortie
            }, 400);
        }, 4000);
    };
```

- [ ] **Step 2: Simplifier le CSS des toasts dans `css/overlays.css`**

Remplacer (lignes 88-116) :

```css
.toast {
    pointer-events: auto;
    min-width: 320px;
    max-width: 420px;
    background: var(--paper);
    border: 1.5px solid var(--ink);
    padding: 16px;
    transform: translateY(40px);
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast.show {
    transform: translateY(0);
    opacity: 1;
}
```

(Les règles `.toast.success`/`.toast.error`/`.toast.info` à bordure colorée sont retirées — la distinction se fait désormais par le mot-clé du kicker, pas par la couleur, cohérent avec l'accent unique.)

- [ ] **Step 3: Réécrire `openCvModal()` en dossier de presse**

Dans `js/app.js`, remplacer le corps de la fonction `openCvModal` de la ligne 426 à la ligne 527 (en gardant la signature, l'activation de la modale et la simulation de téléchargement identiques) :

```javascript
    const openCvModal = () => {
        if (!cvModal || !cvModalContent) return;

        const cv = PORTFOLIO_DATA.cv;
        if (!cv) return;

        const skillsBadges = cv.skills.map(s =>
            `<span class="tag-bracket">${s}</span>`
        ).join(' ');

        const experiencesList = cv.experiences.map(exp => `
            <div class="flex flex-col gap-0.5">
                <div class="flex justify-between items-baseline gap-2">
                    <h5 class="font-bold text-on-surface text-sm">${exp.role}</h5>
                    <span class="font-label-sm text-[10px] text-on-surface-variant shrink-0">${exp.dates}</span>
                </div>
                <span class="text-xs text-on-surface-variant italic">${exp.company}</span>
                <p class="text-xs text-on-surface-variant leading-relaxed mt-1">${exp.description}</p>
            </div>
        `).join('');

        const formationsList = cv.formations.map(f => `
            <div class="flex justify-between items-baseline gap-2">
                <div>
                    <h5 class="font-bold text-on-surface text-sm">${f.degree}</h5>
                    <span class="text-xs text-on-surface-variant">${f.school}</span>
                </div>
                <span class="font-label-sm text-[10px] text-on-surface-variant shrink-0">${f.dates}</span>
            </div>
        `).join('');

        cvModalContent.innerHTML = `
            <div class="flex flex-col gap-5">
                <!-- En-tête du CV (Identité et objectif) -->
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-double border-on-surface pb-4">
                    <div>
                        <h2 class="font-display-lg text-headline-md text-on-surface font-extrabold">${cv.identity.name}</h2>
                        <p class="font-label-sm text-[11px] uppercase tracking-wide text-on-surface-variant mt-1">${cv.identity.role}</p>
                        <p class="text-xs text-on-surface-variant mt-1">${cv.identity.availability}</p>
                    </div>
                    <!-- Bouton de téléchargement simulé -->
                    <button class="font-label-sm text-[11px] uppercase tracking-wide text-on-surface font-bold underline underline-offset-4 hover:text-accent transition-all duration-300" id="download-pdf-btn">
                        Télécharger le CV PDF →
                    </button>
                </div>

                <!-- Contact -->
                <div class="flex flex-col gap-1 border-b border-on-surface/20 pb-3">
                    <h4 class="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant">Contact</h4>
                    <p class="text-xs text-on-surface-variant">${cv.contact.email} · ${cv.contact.phone} · ${cv.contact.location}</p>
                </div>

                <!-- Compétences -->
                <div class="flex flex-col gap-2 border-b border-on-surface/20 pb-3">
                    <h4 class="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant">Compétences clés</h4>
                    <div class="flex flex-wrap gap-2">${skillsBadges}</div>
                </div>

                <!-- Langues -->
                <div class="flex flex-col gap-1 border-b border-on-surface/20 pb-3">
                    <h4 class="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant">Langues</h4>
                    <p class="text-xs text-on-surface-variant">${cv.languages.join(' · ')}</p>
                </div>

                <!-- Expériences -->
                <div class="flex flex-col gap-3 border-b border-on-surface/20 pb-3">
                    <h4 class="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant">Expériences professionnelles</h4>
                    ${experiencesList}
                </div>

                <!-- Formations -->
                <div class="flex flex-col gap-3">
                    <h4 class="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant">Formations</h4>
                    ${formationsList}
                </div>
            </div>
        `;

        // Affiche la modale de CV
        cvModal.classList.add('active');
        cvModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // Simulation d'une attente de génération PDF réaliste (1.4s) lors du clic sur le téléchargement
        const downloadPdfBtn = document.getElementById('download-pdf-btn');
        if (downloadPdfBtn) {
            downloadPdfBtn.addEventListener('click', () => {
                downloadPdfBtn.disabled = true;
                downloadPdfBtn.innerHTML = '<span class="material-symbols-outlined animate-spin" style="margin-right: 6px;">sync</span> Génération...';

                setTimeout(() => {
                    // Restaure le bouton, ferme la modale et affiche une notification de succès
                    downloadPdfBtn.disabled = false;
                    downloadPdfBtn.innerHTML = 'Télécharger le CV PDF →';
                    closeCvModal();
                    showToast("Génération du CV réussie ! Téléchargement démarré. 📄", "success");
                }, 1400);
            });
        }
    };
```

- [ ] **Step 4: Build et vérification**

```bash
npm run build:css
node --check js/app.js
```
Ouvrir `index.html`, cliquer sur "Mon CV" : la modale affiche l'identité en tête, puis Contact/Compétences/Langues/Expériences/Formations en rubriques successives séparées par des filets, en une seule colonne. Cliquer sur "Télécharger le CV PDF" : le bouton passe en état de chargement puis la modale se ferme avec un toast de succès affichant le kicker "Dernière minute". Déclencher un toast d'erreur (soumettre le formulaire de contact vide) : le kicker affiche "Erreur".

- [ ] **Step 5: Commit**

```bash
git add js/app.js css/overlays.css
git commit -m "feat(cv-modal,toasts): press-kit CV layout and news-flash toast styling"
```

---

### Task 10: Passe de vérification finale

**Files:**
- Aucun fichier de production modifié a priori — cette tâche est une vérification croisée ; si elle révèle un écart, corriger dans le fichier concerné.

- [ ] **Step 1: Vérifier le build complet**

```bash
npm run build:css
node --check js/app.js
```
Les deux commandes doivent se terminer sans erreur.

- [ ] **Step 2: Vérifier le contrat d'identifiants**

```bash
grep -o 'id="[a-zA-Z-]*"' index.html | sort -u
```
Comparer manuellement la sortie à la liste de la section "Global Constraints" de ce plan — tous les id listés doivent être présents (les nouveaux id `hero-byline`, `hero-caption`, `download-pdf-btn` sont attendus en plus).

- [ ] **Step 3: Vérification manuelle dans le navigateur**

Ouvrir `index.html` et parcourir dans l'ordre :
- Masthead : dateline visible en haut de page, se rétracte au scroll, liens de nav fonctionnels, menu mobile (réduire la largeur) s'ouvre/se ferme.
- Hero : portrait en N&B/trame, colonnes + lettrine, byline correcte, CTA fonctionnels.
- À propos : les 3 rubriques basculent correctement, formation et valeurs affichées.
- Compétences : barres animées au scroll jusqu'aux pourcentages exacts des données.
- Projets : filtre "Tout"/"Web Advanced"/"Applications Mobiles" fonctionne sans déformation, clic sur une brève ouvre la modale.
- Modale projet : image en N&B/trame, encadré "En bref", liens Démo/Code corrects selon les données (`demo`/`source` à `"#"` = lien absent), fermeture au clic sur "✕" ou en dehors de la modale.
- Contact : soumission avec champs vides déclenche le toast d'erreur ("Dernière minute"/"Erreur" selon le cas) ; focus sur un champ passe le soulignement en rouge.
- Modale CV : ouverture, sections en une colonne, téléchargement simulé ferme la modale et affiche un toast de succès.
- Footer : nameplate + liens + mention d'édition mis à jour dynamiquement.

- [ ] **Step 4: Vérifier la prévisualisation live depuis le dashboard**

Si un dashboard local tourne (`npm run dev` puis `dashboard.html` authentifié), modifier une donnée (ex. `hero.name`) et confirmer que `index.html` ouvert dans un autre onglet se met à jour en temps réel via l'écouteur `storage` (`renderAll()`), avec un toast "Portfolio mis à jour en temps réel ! ⚡". Si aucun dashboard n'est disponible dans l'environnement de vérification, noter ce point comme non testé plutôt que de l'ignorer silencieusement.

- [ ] **Step 5: Nettoyage et commit final**

Si tout est conforme, ne rien committer de nouveau (rien ne devrait avoir changé à cette étape). Si un écart est trouvé et corrigé, committer avec un message décrivant le correctif :

```bash
git add -A
git commit -m "fix: address final verification findings for Le Journal redesign"
```
