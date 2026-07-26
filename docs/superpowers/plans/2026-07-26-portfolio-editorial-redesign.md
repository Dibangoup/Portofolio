# Refonte éditoriale N&B du portfolio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin + restructure `index.html` (public portfolio) from the current Material-You glassmorphic violet style to the approved editorial minimalist black & white direction, without changing `js/portfolio-data.js`'s schema or breaking the dashboard's editing/live-preview contract.

**Architecture:** Almost all color changes flow through two choke points — `tailwind.config.js`'s color/fontFamily tokens (Task 1) and two new global CSS "law" rules that neutralize `rounded-*`/`shadow-*` utilities site-wide (Task 2) — so most existing Tailwind-utility-classed markup updates itself for free. What remains is targeted: a handful of custom CSS components (`.tag-bracket`, `.status-dot`, `.filter-btn`, `.project-card`) and rewriting the six `js/app.js` template-string functions whose injected markup hardcodes the old visual language (colored pills, glass cards, icons).

**Tech Stack:** Static HTML + Tailwind CSS (compiled via CLI, not CDN) + vanilla JS. No test framework is configured for this project (only `tailwindcss`/`express` deps) — see "Verification approach" below.

**Reference spec:** `docs/superpowers/specs/2026-07-26-portfolio-editorial-redesign-design.md`

## Verification approach (no test framework in this repo)

Every task uses three checks instead of unit tests:
1. **Build check** — `npm run build:css` must exit 0 whenever `tailwind.config.js` or any `css/*.css` file changes.
2. **Syntax check** — `node --check js/app.js` must pass whenever `js/app.js` changes (catches typos/mismatched braces without needing a browser).
3. **Manual browser check** — start the dev server (`npm run dev`, http://localhost:3000) and visually confirm the specific behavior described in the task. This is the real "test" for a static site; do not skip it.

## Global Constraints

- **Do not change `js/portfolio-data.js`'s shape.** No field added/removed/renamed. (spec §1)
- **Preserve every id/class listed in spec §7** ("Contrat d'identifiants à préserver") exactly — `js/app.js`'s `renderHero`, `renderAbout`, `renderSkills`, `renderProjects`, `renderContact`, the modal openers, and the dashboard's live-preview `storage` listener all depend on them.
- **No dark mode.** `js/app.js`'s forced-light-mode block (`classList.remove('dark')` / `classList.add('light')`) is not touched.
- **`dashboard.html` / `css/dashboard.css` / `server.js` are out of scope.** Do not edit them in this plan.
- **`html.dark ...` CSS rules in every file are left untouched everywhere in this plan** — they're unreachable dead code (dark mode is force-disabled) and touching them adds risk for zero visible benefit. Do not "clean them up" as a drive-by change.
- **The disabled "Parcours" timeline section (`css/layout.css`, the commented-out block in `index.html`) is untouched.** Out of scope per spec §5.10.
- **Git:** this project's entire directory is currently untracked in its parent git repository (confirmed via `git status` before this plan was written). The first commit of this project is a significant, hard-to-reverse-feeling action. **Before running the first `git commit` in Task 1, stop and ask the user to confirm they want it committed** (and whether to commit only the files this plan touches, or the whole project). If they haven't answered, skip the commit steps in every task, keep working tree changes uncommitted, and say so explicitly at the end.

---

## File Structure

| File | Change |
|---|---|
| `index.html` | Font `<link>` swapped (Task 1); nav/mobile-menu markup (Task 3); Hero markup, mouse-glow/parallax divs removed (Task 4); About tab buttons unchanged in markup (Task 5); Projects filter buttons + grid container class (Task 7); Contact section + form fields + footer markup (Task 9) |
| `tailwind.config.js` | `colors` and `fontFamily` tokens remapped (Task 1) |
| `css/style.css` | New `:root` token block + two global "law" rules (`rounded`, `shadow`) appended after the `@import`s (Task 2) |
| `css/glass.css` | `.glass-card` redefined (Task 2) |
| `css/animations.css` | `.floating`/`@keyframes float` removed (Task 2) |
| `css/components.css` | `.tab-btn.active`, `.form-input:focus` redefined; `.filter-btn`, `.tag-bracket`, `.status-dot`, `.grayscale-emoji`, hero-title gradient override added; `.project-card` redefined (Task 2) |
| `css/overlays.css` | `.modal-overlay`, `.modal-container`, `.toast`, `.toast.info`, `.mobile-nav-overlay` + new `.mobile-nav-link` color redefined (Task 2) |
| `css/utilities.css` | `.mouse-glow` rules removed, `.scroll-progress-bar` recolored (Task 2) |
| `css/scrollbar.css` | Track/thumb colors recolored (Task 2) |
| `js/app.js` | Mouse-glow + parallax listener blocks removed (Task 4); `renderAbout()` education/values templates rewritten (Task 5); `renderSkills()` template rewritten (Task 6); `renderProjects()` template + filter-button classList logic rewritten (Task 7); `openProjectModal()` template rewritten (Task 8); tab-button classList logic simplified (Task 5); `openCvModal()` + `showToast()` templates rewritten (Task 10) |

**New CSS custom properties** (defined once in `css/style.css`, used by name in later tasks — do not redefine elsewhere):
`--paper` `#ffffff`, `--paper-dim` `#f4f4f2`, `--ink` `#111111`, `--ink-70` `rgba(17,17,17,.68)`, `--ink-45` `rgba(17,17,17,.45)`, `--accent` `#7a1f1f`, `--accent-soft` `rgba(122,31,31,.08)`.

**New CSS component classes** (all defined once in `css/components.css` Task 2, reused by name in later tasks):
- `.tag-bracket` — renders `[ text ]` via `::before`/`::after` content, mono, `var(--ink-70)`. Used for: tech tags, hero badges, project quick-links, CV skill badges, contact social links.
- `.status-dot` — small ink-red dot with a pulsing `::before` ring. Used once, in the Hero availability line.
- `.filter-btn` / `.filter-btn.active` — underline-tab treatment for the Projects category filter.
- `.grayscale-emoji` — `filter: grayscale(1) contrast(1.1)`, applied to the About "values" emoji.

---

## Task 1: Typography + color foundation (Tailwind tokens, Google Fonts)

**Files:**
- Modify: `index.html:46-51` (font `<link>` tags)
- Modify: `tailwind.config.js:16-63` (colors), `tailwind.config.js:80-87` (fontFamily)

**Interfaces:**
- Produces: every Tailwind utility class already used in `index.html`/`js/app.js` (e.g. `text-primary`, `bg-surface-container-high`, `font-label-sm`) now resolves to the new palette/typefaces. No new utility class names are introduced by this task.

- [ ] **Step 1: Replace the Google Fonts `<link>` in `index.html`**

Find (lines 48-51):
```html
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&amp;family=Plus+Jakarta+Sans:wght@700;800&amp;display=swap"
      rel="stylesheet"
    />
```
Replace with:
```html
    <link
      href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,600;0,700;0,800;0,900;1,500;1,600&amp;family=Source+Serif+4:wght@400;600&amp;family=IBM+Plex+Mono:wght@400;500;600&amp;display=swap"
      rel="stylesheet"
    />
```

- [ ] **Step 2: Remap `tailwind.config.js` colors**

In the `colors` object, change exactly these keys (leave every other key — `error`, `tertiary*`, `inverse-*`, etc. — untouched; they're not referenced anywhere in `index.html`/`js/app.js`):

```js
primary: "#111111",
"primary-container": "#000000",
"primary-fixed": "#111111",
"primary-fixed-dim": "#111111",
secondary: "#7a1f1f",
"secondary-fixed": "#f4f4f2",
"on-secondary-fixed-variant": "#111111",
"on-secondary": "#ffffff",
background: "#ffffff",
"on-background": "#111111",
surface: "#ffffff",
"surface-bright": "#ffffff",
"surface-dim": "#f4f4f2",
"surface-variant": "#f4f4f2",
"surface-container-lowest": "#ffffff",
"surface-container-low": "#f9f9f8",
"surface-container": "#f4f4f2",
"surface-container-high": "#eeeeec",
"surface-container-highest": "#e8e8e5",
"on-surface": "#111111",
"on-surface-variant": "#4a4a48",
outline: "#111111",
"outline-variant": "#111111",
```

- [ ] **Step 3: Remap `tailwind.config.js` fontFamily**

Replace the `fontFamily` object:
```js
fontFamily: {
  "display-lg": ["Fraunces"],
  "headline-md": ["Fraunces"],
  "body-lg": ["Source Serif 4"],
  "label-sm": ["IBM Plex Mono"],
  "body-md": ["Source Serif 4"],
  "display-lg-mobile": ["Fraunces"],
},
```

- [ ] **Step 4: Rebuild CSS and verify**

Run: `npm run build:css`
Expected: exits 0, prints `Done in ...ms`.

Run: `grep -c "#3525cd" tailwind.config.js`
Expected: `0` (confirms every violet reference was remapped).

- [ ] **Step 5: Manual check**

`npm run dev`, open `http://localhost:3000`. The page will look broken/unstyled in places (component classes haven't been rewritten yet) but body text should already render in Source Serif 4 and no element should show the old violet `#3525cd`/`#4f46e5` anywhere (inspect via devtools computed styles on a couple of elements if unsure).

- [ ] **Step 6: Commit**

**Stop and confirm with the user before this step** (see Global Constraints — the whole project is currently untracked in git).

```bash
git add index.html tailwind.config.js css/tailwind-build.css
git commit -m "style: swap portfolio color/type tokens to editorial B&W palette"
```

---

## Task 2: Global CSS modules (design law + component library)

**Files:**
- Modify: `css/style.css` (append after existing `@import`s)
- Modify: `css/glass.css:26-33`
- Modify: `css/animations.css:45-50,59-62,109-111`
- Modify: `css/components.css` (multiple blocks)
- Modify: `css/overlays.css` (multiple blocks)
- Modify: `css/utilities.css:33-57,16-30`
- Modify: `css/scrollbar.css:14-37`

**Interfaces:**
- Consumes: nothing (pure CSS).
- Produces: `--paper`/`--paper-dim`/`--ink`/`--ink-70`/`--ink-45`/`--accent`/`--accent-soft` custom properties; `.tag-bracket`, `.status-dot`, `.filter-btn`/`.filter-btn.active`, `.grayscale-emoji` classes; redefined `.glass-card`, `.tab-btn.active`, `.form-input:focus`, `.project-card`. All consumed by Tasks 3–10.

- [ ] **Step 1: Append tokens + global design law to `css/style.css`**

Add at the end of the file (after the existing `@import` lines):

```css

/* ==========================================================================
   DESIGN TOKENS — DIRECTION ÉDITORIALE NOIR & BLANC
   ========================================================================== */
:root {
  --paper: #ffffff;
  --paper-dim: #f4f4f2;
  --ink: #111111;
  --ink-70: rgba(17, 17, 17, .68);
  --ink-45: rgba(17, 17, 17, .45);
  --accent: #7a1f1f;
  --accent-soft: rgba(122, 31, 31, .08);
}

/* Loi globale du style "Minimalist Monochrome" : aucun angle arrondi, aucune
   ombre portée, où que ce soit sur le site. Plus sûr et plus simple que de
   traquer chaque classe Tailwind "rounded-*"/"shadow-*" une par une dans
   index.html et js/app.js. */
[class*="rounded"] {
  border-radius: 0 !important;
}
[class*="shadow"] {
  box-shadow: none !important;
}
```

- [ ] **Step 2: Redefine `.glass-card` in `css/glass.css`**

Find (lines 25-33):
```css
/* Classe spécifique pour les cartes de contenu (Bento, CV, Timeline, etc.) */
.glass-card {
    background-color: rgba(255, 255, 255, 0.6) !important;
    backdrop-filter: blur(12px) !important;
    -webkit-backdrop-filter: blur(12px) !important;
    border: 1px solid rgba(255, 255, 255, 0.4) !important;
    /* Ombre portée douce teintée avec la couleur primaire pour donner du relief */
    box-shadow: 0 4px 20px rgba(53, 37, 205, 0.04) !important;
}
```
Replace with:
```css
/* Classe spécifique pour les cartes de contenu (À propos, Contact, CV, Timeline) */
.glass-card {
    background-color: var(--paper) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    border: 1.5px solid var(--ink) !important;
    box-shadow: none !important;
}
```
(Leave `.glass`, `html.dark .glass`, `html.dark .glass-card` untouched — `.glass` is unused in `index.html`, and the `html.dark` blocks are unreachable.)

- [ ] **Step 3: Remove the floating-portrait keyframe in `css/animations.css`**

Delete the `@keyframes float { ... }` block (lines 45-50) and the `.floating { animation: float 6s ease-in-out infinite; }` rule (lines 59-62). Keep `@keyframes bounce-y` — no, actually remove it too: it will have no remaining caller after Task 4 removes the hero badges' `animate-[bounce-y_...]` classes. Delete the `@keyframes bounce-y { ... }` block (lines 52-57) as well.

In the `@media (prefers-reduced-motion: reduce)` block (lines 103-112), remove the now-dangling sub-rule:
```css
    .floating {
        animation: none !important;
    }
```
leaving only the `.reveal { ... }` sub-rule inside that media block.

- [ ] **Step 4: Rewrite `css/components.css`**

Replace the whole file content with:

```css
/* ==========================================================================
   COMPONENTS.CSS — COMPOSANTS UI INTERACTIFS
   ==========================================================================
   Styles des composants réutilisables : onglets "À Propos", jauges de
   compétences, cartes/lignes de projets, champs de formulaire, tags mono,
   icônes Material, statut de disponibilité.
*/


/* ==========================================================================
   1. BOUTONS D'ONGLETS DE LA SECTION "À PROPOS"
   ========================================================================== */

.tab-btn {
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.tab-btn.active {
    background-color: transparent !important;
    color: var(--ink) !important;
    border-bottom: 2px solid var(--accent);
}

.tab-content {
    display: none;
    animation: fadeIn 0.4s ease-out forwards;
}

.tab-content.active {
    display: block;
}


/* ==========================================================================
   2. JAUGE DE COMPÉTENCES ANIMÉE (SKILLS SECTION)
   ========================================================================== */

.skill-bar-fill {
    width: 0;
    transition: width 1.5s cubic-bezier(0.1, 1, 0.1, 1);
}


/* ==========================================================================
   3. LIGNES DE PROJETS — DOSSIER INDEX (remplace l'ancienne carte Bento)
   ========================================================================== */

.project-card {
    transition: background-color 0.3s ease;
}

.project-card:hover,
.project-card:focus-within {
    background-color: var(--paper-dim);
}


/* ==========================================================================
   4. INPUTS DU FORMULAIRE DE CONTACT — style ligne éditoriale
   ========================================================================== */

.form-input {
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.form-input:focus {
    border-color: var(--ink) !important;
    box-shadow: 0 0 0 3px var(--accent-soft) !important;
}


/* ==========================================================================
   5. ICÔNES MATERIAL SYMBOLS — REMPLISSAGE FORCÉ
   ========================================================================== */

.fill-icon {
    font-variation-settings: 'FILL' 1 !important;
}


/* ==========================================================================
   6. TAGS ENTRE CROCHETS MONO — remplace les pastilles colorées
   ==========================================================================
   Utilisé pour : badges du Hero, technologies de projet, liens rapides
   démo/code, compétences du CV, réseaux sociaux du bloc Contact.
*/

.tag-bracket {
    display: inline-flex;
    align-items: baseline;
    font-family: 'IBM Plex Mono', ui-monospace, Consolas, monospace;
    font-size: 11px;
    letter-spacing: .04em;
    color: var(--ink-70);
    white-space: nowrap;
}

.tag-bracket::before {
    content: "[";
    color: var(--ink-45);
    margin-right: 4px;
}

.tag-bracket::after {
    content: "]";
    color: var(--ink-45);
    margin-left: 4px;
}

a.tag-bracket:hover {
    color: var(--accent);
}


/* ==========================================================================
   7. STATUT DE DISPONIBILITÉ (HERO) — point encré + anneau pulsant
   ========================================================================== */

.status-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--accent);
    display: inline-block;
    position: relative;
    flex-shrink: 0;
}

.status-dot::before {
    content: "";
    position: absolute;
    inset: -5px;
    border: 1px solid var(--accent);
    border-radius: 50%;
    animation: pulseRing 2.4s ease-out infinite;
}

@keyframes pulseRing {
    0% { transform: scale(.6); opacity: .9; }
    100% { transform: scale(1.8); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
    .status-dot::before {
        animation: none !important;
        opacity: 0;
    }
}


/* ==========================================================================
   8. FILTRES DE LA GRILLE DE PROJETS — onglets soulignés mono
   ========================================================================== */

.filter-btn {
    font-family: 'IBM Plex Mono', ui-monospace, Consolas, monospace;
    font-size: 11px;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: var(--ink-45);
    padding-bottom: 8px;
    border-bottom: 2px solid transparent;
    transition: color 0.2s ease, border-color 0.2s ease;
}

.filter-btn:hover {
    color: var(--ink);
}

.filter-btn.active {
    color: var(--ink);
    border-bottom-color: var(--accent);
}


/* ==========================================================================
   9. EMOJI DES VALEURS (À PROPOS) — désaturé pour rester cohérent avec le N&B
   ========================================================================== */

.grayscale-emoji {
    filter: grayscale(1) contrast(1.1);
}


/* ==========================================================================
   10. NEUTRALISATION DU DÉGRADÉ DE COULEUR DU TITRE HERO
   ==========================================================================
   Le champ hero.title (schéma de données inchangé) contient toujours le
   span avec ces 3 classes Tailwind ; on annule juste le dégradé coloré au
   profit d'un style italique gris, sans toucher au contenu ni au dashboard.
*/

.text-transparent.bg-clip-text.bg-gradient-to-r {
    background-image: none;
    -webkit-background-clip: initial;
    background-clip: initial;
    color: var(--ink-70);
    font-style: italic;
}
```

- [ ] **Step 5: Rewrite `css/overlays.css`**

Replace the whole file content with:

```css
/* ==========================================================================
   OVERLAYS.CSS — COUCHES DE SUPERPOSITION (MODALES, MENU MOBILE, TOASTS)
   ========================================================================== */


/* ==========================================================================
   1. MENU MOBILE PLEIN ÉCRAN (OVERLAY)
   ========================================================================== */

.mobile-nav-overlay {
    position: fixed;
    inset: 0;
    background-color: var(--ink);
    z-index: 49;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    opacity: 0;
    pointer-events: none;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.mobile-nav-overlay.active {
    opacity: 1;
    pointer-events: all;
}

.mobile-nav-link {
    color: var(--paper);
}


/* ==========================================================================
   2. SYSTÈME DE FENÊTRES MODALES (DÉTAILS PROJETS & CV)
   ========================================================================== */

.modal-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(17, 17, 17, 0.55);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    padding: 16px;
}

.modal-overlay.active {
    opacity: 1;
    pointer-events: all;
}

.modal-container {
    background-color: var(--paper);
    border: 2px solid var(--ink);
    width: 100%;
    max-width: 700px;
    max-height: 90vh;
    overflow-y: auto;
    transform: scale(0.96) translateY(16px);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-overlay.active .modal-container {
    transform: scale(1) translateY(0);
}


/* ==========================================================================
   3. SYSTÈME DE NOTIFICATIONS FLOTTANTES (TOASTS)
   ========================================================================== */

.toast-container {
    position: fixed;
    bottom: 24px;
    right: 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    z-index: 200;
    pointer-events: none;
}

.toast {
    pointer-events: auto;
    min-width: 320px;
    max-width: 420px;
    background: var(--paper);
    border: 1.5px solid var(--ink);
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    transform: translateY(40px);
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast.show {
    transform: translateY(0);
    opacity: 1;
}

.toast.success {
    border-left: 4px solid #10b981;
}
.toast.error {
    border-left: 4px solid #ef4444;
}
.toast.info {
    border-left: 4px solid var(--ink);
}
```

(This drops every `html.dark ...` sub-rule that existed in the old file — they were all unreachable already, and the whole file is being replaced wholesale here since nearly every rule changes; this is the one file where a full rewrite is cleaner than a diff.)

- [ ] **Step 6: Rewrite `css/utilities.css`**

Replace the whole file content with:

```css
/* ==========================================================================
   UTILITIES.CSS — UTILITAIRES VISUELS GLOBAUX
   ==========================================================================
   Barre de progression de lecture. (Le halo de souris coloré a été retiré :
   incompatible avec la direction éditoriale N&B — voir spec §5.2/§6.)
*/

.scroll-progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    width: 0%;
    background: var(--ink);
    transition: width 0.1s ease-out;
    z-index: 100;
}
```

- [ ] **Step 7: Recolor `css/scrollbar.css`**

Find (lines 13-37, the light-mode rules only — leave the three `html.dark ...` rules untouched):
```css
::-webkit-scrollbar-track {
    background: #f0f3ff;
}

html.dark ::-webkit-scrollbar-track {
    background: #0f172a;
}

::-webkit-scrollbar-thumb {
    background: #c7c4d8;
    border-radius: 9999px;
}

html.dark ::-webkit-scrollbar-thumb {
    background: #475569;
}

::-webkit-scrollbar-thumb:hover {
    background: #777587;
}
```
Replace the three light-mode rules only:
```css
::-webkit-scrollbar-track {
    background: var(--paper-dim);
}

html.dark ::-webkit-scrollbar-track {
    background: #0f172a;
}

::-webkit-scrollbar-thumb {
    background: #cccccc;
    border-radius: 9999px;
}

html.dark ::-webkit-scrollbar-thumb {
    background: #475569;
}

::-webkit-scrollbar-thumb:hover {
    background: #555555;
}
```
(Note: `border-radius: 9999px` on the scrollbar thumb is a browser pseudo-element, not matched by the `[class*="rounded"]` law in Task 2 — it's fine to keep a rounded scrollbar thumb; the "no radius" rule is about visible content blocks, not OS-level scrollbar chrome. This is a deliberate exception, not an oversight.)

- [ ] **Step 8: Build and verify**

Run: `npm run build:css`
Expected: exits 0.

Run: `grep -rn "3525cd\|4f46e5\|rgba(53, 37, 205" css/*.css`
Expected: no output (confirms every hardcoded violet hex was replaced across all CSS modules).

- [ ] **Step 9: Manual check**

`npm run dev`, reload `http://localhost:3000`. The About-tabs panel, Contact info cards, and CV/project modal frames (if you can trigger them, ignore console errors from missing markup for now) should show a plain white background with a solid black border, no blur, no shadow, no rounded corners.

- [ ] **Step 10: Commit** (only if user confirmed git usage in Task 1)

```bash
git add css/style.css css/glass.css css/animations.css css/components.css css/overlays.css css/utilities.css css/scrollbar.css css/tailwind-build.css
git commit -m "style: rewrite CSS modules for editorial B&W component library"
```

---

## Task 3: Navigation + mobile menu markup

**Files:**
- Modify: `index.html:91-174` (desktop nav), `index.html:183-225` (mobile overlay)

**Interfaces:**
- Consumes: `.tag-bracket` is not used here. Relies on Task 1's `font-label-sm` → IBM Plex Mono remap and Task 2's `.mobile-nav-link` color rule.
- Produces: nothing new consumed by later tasks (nav is a leaf).

- [ ] **Step 1: Make the navbar opaque (drop the glass/blur look)**

Find (`index.html:91-94`):
```html
    <nav
      class="docked full-width top-0 sticky z-50 bg-surface/80 dark:bg-surface-container/80 backdrop-blur-xl border-b border-outline-variant/10 shadow-sm transition-all duration-300 h-20"
      id="navbar"
    >
```
Replace with:
```html
    <nav
      class="docked full-width top-0 sticky z-50 bg-surface border-b border-on-surface transition-all duration-300 h-20"
      id="navbar"
    >
```

- [ ] **Step 2: Restyle the wordmark to a mono label (keep `id="nav-logo"`)**

Find (`index.html:99-107`):
```html
        <a
          class="font-display-lg text-headline-md font-extrabold text-primary dark:text-primary-fixed-dim tracking-tight"
          href="#hero"
          id="nav-logo"
        >
          D.J Portfolio<span
            class="w-2 h-2 rounded-full bg-secondary inline-block ml-1"
          ></span>
        </a>
```
Replace with:
```html
        <a
          class="font-label-sm text-[13px] font-semibold uppercase tracking-[0.14em] text-on-surface"
          href="#hero"
          id="nav-logo"
        >
          D.J Portfolio<span
            class="w-2 h-2 rounded-full bg-secondary inline-block ml-1"
          ></span>
        </a>
```
(This element's text content is overwritten at runtime by `renderHero()` — see Task Interfaces below, no `js/app.js` change needed since it only sets `.innerHTML`, not classes.)

- [ ] **Step 3: Number the desktop nav links**

Find (`index.html:110-149`, the four visible `<li>` — "Parcours" stays commented out, don't touch it):
```html
        <ul class="hidden md:flex items-center gap-lg">
          <li>
            <a
              class="font-label-sm text-label-sm text-on-surface-variant font-medium hover:text-primary transition-colors duration-300 nav-link"
              href="#about"
              >À Propos</a
            >
          </li>
          <li>
            <a
              class="font-label-sm text-label-sm text-on-surface-variant font-medium hover:text-primary transition-colors duration-300 nav-link"
              href="#skills"
              >Compétences</a
            >
          </li>
          <li>
            <a
              class="font-label-sm text-label-sm text-on-surface-variant font-medium hover:text-primary transition-colors duration-300 nav-link"
              href="#projects"
              >Projets</a
            >
          </li>
          <!-- ... commented-out Parcours li stays as-is ... -->
          <li>
            <a
              class="font-label-sm text-label-sm text-on-surface-variant font-medium hover:text-primary transition-colors duration-300 nav-link"
              href="#contact"
              >Contact</a
            >
          </li>
        </ul>
```
Replace each `hover:text-primary` with `hover:text-secondary` (now the ink-red accent) and prefix each label with its section number, keeping the commented-out Parcours block exactly as-is in between:
```html
        <ul class="hidden md:flex items-center gap-lg">
          <li>
            <a
              class="font-label-sm text-label-sm text-on-surface-variant font-medium hover:text-secondary transition-colors duration-300 nav-link"
              href="#about"
              >02 — À Propos</a
            >
          </li>
          <li>
            <a
              class="font-label-sm text-label-sm text-on-surface-variant font-medium hover:text-secondary transition-colors duration-300 nav-link"
              href="#skills"
              >03 — Compétences</a
            >
          </li>
          <li>
            <a
              class="font-label-sm text-label-sm text-on-surface-variant font-medium hover:text-secondary transition-colors duration-300 nav-link"
              href="#projects"
              >04 — Projets</a
            >
          </li>
          <li>
            <a
              class="font-label-sm text-label-sm text-on-surface-variant font-medium hover:text-secondary transition-colors duration-300 nav-link"
              href="#contact"
              >05 — Contact</a
            >
          </li>
        </ul>
```

- [ ] **Step 4: Restyle the "Mon CV" button**

Find (`index.html:155-159`):
```html
          <a
            class="hidden md:inline-flex bg-primary hover:bg-primary-container text-white px-md py-xs rounded-full font-label-sm text-label-sm transition-all duration-200 hover:scale-[1.05] active:scale-95 btn-shimmer cursor-pointer"
            id="cv-btn"
            >Mon CV</a
          >
```
Replace with:
```html
          <a
            class="hidden md:inline-flex border-2 border-on-surface hover:border-secondary hover:text-secondary text-on-surface px-md py-xs font-label-sm text-label-sm uppercase tracking-wide transition-all duration-200 cursor-pointer"
            id="cv-btn"
            >Mon CV</a
          >
```

- [ ] **Step 5: Number the mobile overlay links and restyle the type**

Find (`index.html:184-224`, the four visible `<li>`):
```html
      <ul class="flex flex-col gap-6 items-center text-center">
        <li>
          <a
            class="mobile-nav-link text-xl font-bold font-display-lg"
            href="#about"
            >À Propos</a
          >
        </li>
        <li>
          <a
            class="mobile-nav-link text-xl font-bold font-display-lg"
            href="#skills"
            >Compétences</a
          >
        </li>
        <li>
          <a
            class="mobile-nav-link text-xl font-bold font-display-lg"
            href="#projects"
            >Projets</a
          >
        </li>
        <!-- ... commented-out Parcours li stays as-is ... -->
        <li>
          <a
            class="mobile-nav-link text-xl font-bold font-display-lg"
            href="#contact"
            >Contact</a
          >
        </li>
      </ul>
```
Replace the four visible link texts (keep classes, keep the commented Parcours block untouched):
```html
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
        <li>
          <a
            class="mobile-nav-link text-xl font-bold font-display-lg"
            href="#contact"
            >05 — Contact</a
          >
        </li>
      </ul>
```

- [ ] **Step 6: Build and manual check**

Run: `npm run build:css` (exits 0).

`npm run dev`, open `http://localhost:3000`: nav is opaque white with a black bottom hairline, wordmark is small-caps mono, desktop links show `02 — À Propos` etc. and turn ink-red on hover, shrink to a narrow viewport and confirm the burger menu opens a full-black overlay with white numbered links.

- [ ] **Step 7: Commit** (only if user confirmed git usage)

```bash
git add index.html
git commit -m "feat(nav): editorial mono wordmark, numbered links, opaque navbar"
```

---

## Task 4: Hero section

**Files:**
- Modify: `index.html:239-355`
- Modify: `js/app.js:103-134` (remove mouse-glow listeners), `js/app.js:630-652` (remove parallax listener)

**Interfaces:**
- Consumes: `.status-dot`, `.tag-bracket` (Task 2).
- Produces: nothing new consumed elsewhere. `#hero-availability`, `#hero-title`, `#hero-description`, `#hero-img`, `#hero-badge-1`, `#hero-badge-2` ids stay exactly as `renderHero()` (unchanged) expects.

- [ ] **Step 1: Remove the mouse-glow and parallax decorative divs**

In the `<section id="hero">` (`index.html:239-254`), delete these three lines:
```html
        <!-- Rond de lumière interactive (Mouse Glow) -->
        <div class="mouse-glow" id="mouse-glow"></div>
        
        <!-- Bulles colorées floues d'arrière-plan avec déplacement parallaxe au scroll -->
        <div
          class="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 parallax-bg"
          data-speed="0.2"
        ></div>
        <div
          class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2 parallax-bg-bottom"
          data-speed="-0.15"
        ></div>
```
so the section opens directly with the `<!-- Grille : Texte à gauche, Image à droite -->` grid div.

- [ ] **Step 2: Restyle the availability status line**

Find (`index.html:261-272`):
```html
            <div
              class="inline-flex items-center gap-xs bg-surface-container-high dark:bg-surface-variant px-sm py-xs rounded-full w-fit"
            >
              <span
                class="w-2 h-2 rounded-full bg-primary animate-pulse"
              ></span>
              <span
                class="font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface"
                id="hero-availability"
                >Disponible pour un stage</span
              >
            </div>
```
Replace with:
```html
            <div class="inline-flex items-center gap-2 w-fit">
              <span class="status-dot"></span>
              <span
                class="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant"
                id="hero-availability"
                >Disponible pour un stage</span
              >
            </div>
```

- [ ] **Step 3: Simplify the CTA buttons (drop shadow/shimmer, keep color tokens as-is — they already resolve to ink via Task 1)**

Find (`index.html:297-308`):
```html
            <div class="flex flex-wrap gap-sm mt-sm">
              <a
                class="inline-flex items-center justify-center bg-primary hover:bg-primary-container text-white px-lg py-sm rounded-lg font-label-sm text-label-sm transition-all duration-300 hover:scale-[1.05] shadow-[0_4px_14px_rgba(53,37,205,0.39)] btn-shimmer"
                href="#projects"
                >Mes Projets</a
              >
              <a
                class="inline-flex items-center justify-center border border-primary text-primary hover:bg-primary/5 px-lg py-sm rounded-lg font-label-sm text-label-sm transition-all duration-300 hover:scale-[1.05]"
                href="#contact"
                >Contact</a
              >
            </div>
```
Replace with:
```html
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
```
(`rounded-lg`/`shadow-[...]` were already neutralized site-wide by Task 2's global law rules, but removing them here too keeps the markup honest about what's actually happening visually.)

- [ ] **Step 4: Replace the circular floating portrait + glass badges with a rectangular framed portrait + bracket tags**

Find (`index.html:311-353`):
```html
          <!-- Colonne de droite : Cadre photo premium et badges flottants -->
          <div
            class="order-1 md:order-2 flex justify-center md:justify-end reveal delay-200"
          >
            <!-- Bulle de flottaison contenant le portrait -->
            <div
              class="relative w-64 h-64 md:w-96 md:h-96 rounded-full p-2 bg-gradient-to-tr from-primary/20 to-secondary/20 floating"
            >
              <!-- Portrait principal de l'étudiant (remplacez le 'src' par votre propre photo) -->
              <div
                class="w-full h-full rounded-full overflow-hidden border-4 border-surface dark:border-surface-variant glass-card relative"
              >
                <img
                  alt="Portrait de l'étudiant"
                  class="w-full h-full object-cover"
                  id="hero-img"
                  src="images/jordan-portrait.jpg"
                />
              </div>
              
              <!-- Badges flottants interactifs (Modifiables selon vos spécialités) -->
              <!-- Badge flottant gauche (Développeur) -->
              <div
                class="absolute top-10 -left-6 glass-card px-4 py-2 rounded-xl flex items-center gap-2 animate-[bounce-y_4s_infinite]"
              >
                <span class="material-symbols-outlined text-primary fill-icon"
                  >code</span
                >
                <span class="font-label-sm text-label-sm" id="hero-badge-1">Développeur Web</span>
              </div>
              <!-- Badge flottant droit (Développeur Mobile) -->
              <div
                class="absolute bottom-10 -right-6 glass-card px-4 py-2 rounded-xl flex items-center gap-2 animate-[bounce-y_5s_infinite_reverse]"
              >
                <span class="material-symbols-outlined text-secondary fill-icon"
                >mobile</span
                >
                <span class="font-label-sm text-label-sm" id="hero-badge-2"
                  >Développeur Mobile</span
                >
              </div>
            </div>
          </div>
```
Replace with:
```html
          <!-- Colonne de droite : Portrait cadré + tags mono -->
          <div
            class="order-1 md:order-2 flex flex-col items-center md:items-end gap-4 reveal delay-200"
          >
            <div class="w-64 h-64 md:w-80 md:h-96 border-2 border-on-surface overflow-hidden">
              <img
                alt="Portrait de l'étudiant"
                class="w-full h-full object-cover grayscale contrast-125"
                id="hero-img"
                src="images/jordan-portrait.jpg"
              />
            </div>
            <div class="flex gap-4">
              <span class="tag-bracket" id="hero-badge-1">Développeur Web</span>
              <span class="tag-bracket" id="hero-badge-2">Développeur Mobile</span>
            </div>
          </div>
```

- [ ] **Step 5: Remove the mouse-glow JS block from `js/app.js`**

Delete the whole "5. HALO LUMINEUX DE SOURIS" block (`js/app.js:103-134`, from the section comment through the closing `}` of the `if (heroSection && mouseGlow ...)` block). `heroSection` (the `const heroSection = document.getElementById('hero');` line) is still used elsewhere? Check: it isn't referenced anywhere else in the file, so delete that `const` line too as part of this block.

- [ ] **Step 6: Remove the parallax JS block from `js/app.js`**

Delete the whole "9. EFFET DE PARALLAXE DOUX" block (`js/app.js:630-652`, the entire `if (!prefersReducedMotion) { window.addEventListener('scroll', () => { ... }); }` block that queries `.parallax-bg`/`.parallax-bg-bottom`).

- [ ] **Step 7: Syntax check**

Run: `node --check js/app.js`
Expected: no output (pass).

- [ ] **Step 8: Build and manual check**

Run: `npm run build:css` (exits 0).

`npm run dev`, reload: Hero shows a red pulsing status dot + mono "DISPONIBLE POUR UN STAGE", serif headline, black CTA + outline CTA, a rectangular black-and-white portrait (no circular frame, no floating motion), two `[ Développeur Web ]` / `[ Développeur Mobile ]` tags below it. Move the mouse over the hero — no glow should follow it. Scroll the page — nothing should visibly parallax (there's nothing left to parallax).

- [ ] **Step 9: Commit** (only if user confirmed git usage)

```bash
git add index.html js/app.js
git commit -m "feat(hero): editorial B&W hero, remove mouse-glow and parallax blobs"
```

---

## Task 5: About section (tabs, education, values)

**Files:**
- Modify: `js/app.js:271-292` (`renderAbout` education/values blocks), `js/app.js:679-695` (tab-button classList)

**Interfaces:**
- Consumes: `.grayscale-emoji` (Task 2). `.tab-btn`/`.tab-btn.active` CSS from Task 2 (no markup change needed in `index.html` for the tab buttons themselves — see note below).
- Produces: nothing new consumed elsewhere.

- [ ] **Step 1: Note on tab button markup — no `index.html` edit needed here**

The three tab buttons (`index.html:414-437`) keep their existing classes (`tab-btn active px-4 py-2 font-label-sm ... rounded-lg text-on-surface-variant bg-surface-container-high dark:bg-surface-variant` on the first one). Task 2's `.tab-btn.active { background-color: transparent !important; ... }` neutralizes the stray `bg-surface-container-high` visually, and Task 2's global `[class*="rounded"]` law neutralizes `rounded-lg`. Nothing to change here.

- [ ] **Step 2: Rewrite the education + values injected templates in `renderAbout()`**

Find (`js/app.js:271-291`):
```js
        const eduContainer = document.getElementById('about-education-container');
        if (eduContainer && a.education) {
            eduContainer.innerHTML = a.education.map(e => `
                <div class="relative pl-6 border-l-2 border-primary/30">
                  <div class="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1"></div>
                  <span class="text-xs font-bold text-primary dark:text-primary-fixed-dim">${e.dates}</span>
                  <h4 class="text-sm font-bold text-on-surface">${e.degree}</h4>
                  <p class="text-xs font-semibold text-on-surface-variant mb-1">${e.school}</p>
                  <p class="text-xs text-on-surface-variant">${e.desc}</p>
                </div>
            `).join('');
        }
        
        const valuesContainer = document.getElementById('about-values-container');
        if (valuesContainer && a.values) {
            valuesContainer.innerHTML = a.values.map(v => `
                <li>
                  ${v.emoji || '🚀'} <strong>${v.title} :</strong> ${v.desc}
                </li>
            `).join('');
        }
```
Replace with:
```js
        const eduContainer = document.getElementById('about-education-container');
        if (eduContainer && a.education) {
            eduContainer.innerHTML = a.education.map(e => `
                <div class="relative pl-6 border-l-2 border-on-surface">
                  <span class="block font-label-sm text-label-sm text-secondary mb-1">${e.dates}</span>
                  <h4 class="font-display-lg text-sm font-bold text-on-surface">${e.degree}</h4>
                  <p class="text-xs font-semibold text-on-surface-variant mb-1">${e.school}</p>
                  <p class="text-xs text-on-surface-variant">${e.desc}</p>
                </div>
            `).join('');
        }

        const valuesContainer = document.getElementById('about-values-container');
        if (valuesContainer && a.values) {
            valuesContainer.innerHTML = a.values.map(v => `
                <li class="flex items-start gap-3">
                  <span class="grayscale-emoji text-base leading-none mt-0.5">${v.emoji || '🚀'}</span>
                  <span><strong class="font-semibold text-on-surface">${v.title} —</strong> ${v.desc}</span>
                </li>
            `).join('');
        }
```
(Dropped the absolutely-positioned colored dot per diploma — the mono date label + ink border-left already carries the timeline meaning without a decorative filled circle.)

- [ ] **Step 3: Simplify the tab-button classList toggling**

Find (`js/app.js:682-694`):
```js
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
Replace with:
```js
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');

            // Désactive tous les boutons d'onglets et les contenus
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Active uniquement l'onglet cliqué
            button.classList.add('active');
            const targetContent = document.getElementById(`tab-${tabName}`);
            if (targetContent) targetContent.classList.add('active');
        });
    });
```

- [ ] **Step 4: Syntax check**

Run: `node --check js/app.js` — expected: pass.

- [ ] **Step 5: Manual check**

`npm run dev`, scroll to "À Propos". Click all three tabs ("Mon Histoire", "Mes Études", "Mes Valeurs") — active tab shows a red underline instead of a filled violet pill. In "Mes Études", each diploma shows a red mono date, serif degree title, ink left border, no colored dot. In "Mes Valeurs", each emoji renders desaturated (grey, not colorful).

- [ ] **Step 6: Commit** (only if user confirmed git usage)

```bash
git add js/app.js
git commit -m "feat(about): editorial education/values templates, underline tabs"
```

---

## Task 6: Skills section

**Files:**
- Modify: `js/app.js:294-326` (`renderSkills`)

**Interfaces:**
- Consumes: `.glass-card` (Task 2), `font-display-lg`/`font-label-sm` (Task 1 remap).
- Produces: nothing new consumed elsewhere. `#skills-categories-container`, `.skill-bar-fill`, `data-percent` ids/attrs unchanged — `triggerSkillsAnimation()` (untouched) keeps working.

- [ ] **Step 1: Rewrite `renderSkills()`**

Find (`js/app.js:294-326`):
```js
    const renderSkills = () => {
        const container = document.getElementById('skills-categories-container');
        if (!container || !PORTFOLIO_DATA.skills) return;
        
        container.innerHTML = PORTFOLIO_DATA.skills.map((cat, catIdx) => {
            const skillItemsHtml = cat.items.map(item => `
                <div class="flex flex-col gap-1">
                  <div class="flex justify-between text-xs font-semibold text-on-surface-variant">
                    <span>${item.name}</span>
                    <span>${item.percent}%</span>
                  </div>
                  <div class="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-primary to-secondary rounded-full skill-bar-fill" style="width: 0%;" data-percent="${item.percent}"></div>
                  </div>
                </div>
            `).join('');
            
            return `
                <div class="glass-card rounded-xl p-6 reveal delay-${catIdx * 100} flex flex-col gap-6">
                  <div class="flex items-center gap-3">
                    <span class="material-symbols-outlined text-primary text-2xl">${cat.icon || 'star'}</span>
                    <h3 class="text-lg font-bold text-on-surface font-headline-md">${cat.category}</h3>
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
Replace with:
```js
    const renderSkills = () => {
        const container = document.getElementById('skills-categories-container');
        if (!container || !PORTFOLIO_DATA.skills) return;

        container.innerHTML = PORTFOLIO_DATA.skills.map((cat, catIdx) => {
            const skillItemsHtml = cat.items.map(item => `
                <div class="flex flex-col gap-1">
                  <div class="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
                    <span>${item.name}</span>
                    <span class="tabular-nums">${item.percent}%</span>
                  </div>
                  <div class="w-full h-[3px] bg-surface-container-high overflow-hidden">
                    <div class="h-full bg-on-surface skill-bar-fill" style="width: 0%;" data-percent="${item.percent}"></div>
                  </div>
                </div>
            `).join('');

            return `
                <div class="glass-card p-6 reveal delay-${catIdx * 100} flex flex-col gap-6">
                  <div class="flex items-center justify-between border-b border-on-surface pb-3">
                    <h3 class="font-display-lg text-lg font-bold text-on-surface">${cat.category}</h3>
                    <span class="font-label-sm text-label-sm text-on-surface-variant">0${catIdx + 1}</span>
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
Note: this deliberately stops rendering `cat.icon` (the Material Symbols icon name). The field still exists in the data/dashboard (out of scope to remove it there), it's just not displayed on the public site anymore — a numbered mono index (`01`, `02`, `03`) replaces the colored icon, consistent with the numbered-marker convention used elsewhere on the page.

- [ ] **Step 2: Syntax check**

Run: `node --check js/app.js` — expected: pass.

- [ ] **Step 3: Manual check**

`npm run dev`, scroll to "Compétences". Each category is a bordered white block with a serif title + `01`/`02`/`03` mono index, no colored icon. Each skill row shows a thin black bar that fills to its percentage on scroll-into-view (same animation timing as before, just black instead of gradient).

- [ ] **Step 4: Commit** (only if user confirmed git usage)

```bash
git add js/app.js
git commit -m "feat(skills): editorial spec-sheet skill blocks, solid ink bars"
```

---

## Task 7: Projects section — dossier list + filter

**Files:**
- Modify: `index.html:547-576` (filter buttons + grid container)
- Modify: `js/app.js:328-400` (`renderProjects`), `js/app.js:736-774` (filter classList logic)

**Interfaces:**
- Consumes: `.tag-bracket`, `.filter-btn`/`.filter-btn.active`, `.project-card` (Task 2).
- Produces: `.project-card` elements now use **`display: grid`** (not `block`) when shown — Task 8 and any future code touching `card.style.display` must use `'grid'`, not `'block'`.

- [ ] **Step 1: Simplify the filter buttons markup**

Find (`index.html:548-567`):
```html
        <div class="flex justify-center gap-xs mb-lg flex-wrap reveal">
          <button
            class="filter-btn active bg-primary text-white border border-primary px-sm py-2 rounded-full font-label-sm text-label-sm"
            data-filter="all"
          >
            Tout
          </button>
          <button
            class="filter-btn border border-outline-variant/30 hover:border-primary hover:text-primary transition-all duration-300 px-sm py-2 rounded-full font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface"
            data-filter="web"
          >
            Web Advanced
          </button>
          <button
            class="filter-btn border border-outline-variant/30 hover:border-primary hover:text-primary transition-all duration-300 px-sm py-2 rounded-full font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface"
            data-filter="mobile"
          >
            Applications Mobiles
          </button>
        </div>
```
Replace with:
```html
        <div class="flex justify-center gap-lg mb-lg flex-wrap reveal">
          <button class="filter-btn active" data-filter="all">Tout</button>
          <button class="filter-btn" data-filter="web">Web Advanced</button>
          <button class="filter-btn" data-filter="mobile">Applications Mobiles</button>
        </div>
```

- [ ] **Step 2: Drop the grid gap classes that assumed a bento layout**

Find (`index.html:570-573`):
```html
        <div
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md"
          id="projects-grid"
        >
```
Replace with:
```html
        <div class="flex flex-col" id="projects-grid">
```
(The dossier list is a single column of rows, not a multi-column card grid — each row internally uses its own `grid-cols-[...]` for the number/text/thumbnail layout, set in the `renderProjects()` template below.)

- [ ] **Step 3: Rewrite `renderProjects()`**

Find (`js/app.js:328-400`, the entire function including its trailing `document.querySelectorAll(...).forEach(...)` click-binding block):
```js
    const renderProjects = () => {
        const grid = document.getElementById('projects-grid');
        if (!grid || !PORTFOLIO_DATA.projects) return;
        
        grid.innerHTML = PORTFOLIO_DATA.projects.map((proj, projIdx) => `
          <div
            class="group glass-card rounded-xl overflow-hidden hover:shadow-[0_20px_40px_rgba(53,37,205,0.15)] project-card reveal delay-${(projIdx % 3) * 100} cursor-pointer"
            data-category="${proj.category}"
            data-project-id="${proj.id}"
          >
            ...
          </div>
        `).join('');

        // Attache les événements de clic sur les nouvelles vignettes de projets
        document.querySelectorAll('#projects-grid .project-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.external-link')) return; 
                const projectId = card.getAttribute('data-project-id');
                if (projectId) openProjectModal(projectId);
            });
        });
    };
```
Replace the whole function body with:
```js
    const renderProjects = () => {
        const grid = document.getElementById('projects-grid');
        if (!grid || !PORTFOLIO_DATA.projects) return;

        grid.innerHTML = PORTFOLIO_DATA.projects.map((proj, projIdx) => {
            const quickLinks = [
                proj.demo !== '#' ? `<a href="${proj.demo}" target="_blank" class="tag-bracket external-link" aria-label="Voir la démo">demo</a>` : '',
                proj.source !== '#' ? `<a href="${proj.source}" target="_blank" class="tag-bracket external-link" aria-label="Voir le code source">code</a>` : ''
            ].join('');

            return `
          <div
            class="group project-card grid grid-cols-[40px_1fr] md:grid-cols-[64px_1fr_220px] gap-6 items-start border-b border-on-surface py-8 reveal delay-${(projIdx % 3) * 100} cursor-pointer"
            data-category="${proj.category}"
            data-project-id="${proj.id}"
          >
            <div class="font-label-sm text-label-sm text-on-surface-variant pt-1 tabular-nums">${String(projIdx + 1).padStart(2, '0')}</div>

            <div class="flex flex-col gap-2 min-w-0">
              <span class="font-label-sm text-label-sm text-secondary uppercase tracking-wide">${proj.categoryLabel}</span>
              <h3 class="font-display-lg text-xl font-bold text-on-surface project-title">${proj.cardTitle}</h3>
              <p class="text-sm text-on-surface-variant max-w-[60ch]">${proj.shortDescription}</p>
              <div class="flex flex-wrap items-center gap-3 mt-1">
                ${proj.tech.slice(0, 4).map(t => `<span class="tag-bracket">${t}</span>`).join('')}
                ${quickLinks}
              </div>
            </div>

            <div class="hidden md:block h-full min-h-[110px] overflow-hidden border border-on-surface">
              <img
                alt="${proj.cardTitle}"
                class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-[filter] duration-500"
                src="${proj.image}"
              />
            </div>
          </div>
        `;
        }).join('');

        // Attache les événements de clic sur les nouvelles lignes de projets
        document.querySelectorAll('#projects-grid .project-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.external-link')) return;
                const projectId = card.getAttribute('data-project-id');
                if (projectId) openProjectModal(projectId);
            });
        });
    };
```

- [ ] **Step 4: Fix the filter click handler (remove hardcoded utility classes, restore `display: grid`)**

Find (`js/app.js:739-773`):
```js
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filterValue = button.getAttribute('data-filter');

            // Réinitialise l'état actif de tous les boutons de filtrage
            filterButtons.forEach(btn => {
                btn.classList.remove('active', 'bg-primary', 'text-white');
                btn.classList.add('text-on-surface-variant');
            });
            
            // Active visuellement le bouton cliqué
            button.classList.add('active', 'bg-primary', 'text-white');
            button.classList.remove('text-on-surface-variant');

            // Parcourt chaque carte de projet de la grille
            projectCardsGrid.forEach(card => {
                const category = card.getAttribute('data-category');

                if (filterValue === 'all' || category === filterValue) {
                    // Affiche l'élément sous forme de bloc pour conserver l'empilement vertical corrigé
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0) scale(1)';
                    }, 50);
                } else {
                    // Réduit et masque l'élément progressivement avant de le masquer du flux
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(15px) scale(0.96)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 350);
                }
            });
        });
    });
```
Replace with:
```js
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filterValue = button.getAttribute('data-filter');

            // Réinitialise l'état actif de tous les boutons de filtrage
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Active visuellement le bouton cliqué
            button.classList.add('active');

            // Parcourt chaque ligne de projet du dossier
            projectCardsGrid.forEach(card => {
                const category = card.getAttribute('data-category');

                if (filterValue === 'all' || category === filterValue) {
                    // "grid" (pas "block") : chaque ligne utilise en interne
                    // grid-cols-[...] pour aligner numéro / texte / vignette.
                    card.style.display = 'grid';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0) scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(15px) scale(0.96)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 350);
                }
            });
        });
    });
```

- [ ] **Step 5: Syntax check**

Run: `node --check js/app.js` — expected: pass.

- [ ] **Step 6: Build and manual check**

Run: `npm run build:css` (exits 0).

`npm run dev`, scroll to "Projets récents". You should see 4-6 numbered rows (not cards), each with category label in red, serif title, description, bracketed tech tags, and (on desktop width) a black-and-white thumbnail on the right that turns to color on hover. Click a row (not on a `[ demo ]`/`[ code ]` link) — the project modal should open (template not yet rewritten — that's Task 8, so it may look visually broken; confirm it *opens*, that's what this task verifies). Click the "Web Advanced" / "Applications Mobiles" filters — rows should filter in/out with the fade transition, and the active filter tab should show a red underline instead of a solid pill.

- [ ] **Step 7: Commit** (only if user confirmed git usage)

```bash
git add index.html js/app.js
git commit -m "feat(projects): bento grid -> numbered dossier list, underline filters"
```

---

## Task 8: Project detail modal

**Files:**
- Modify: `js/app.js:146-200` (`openProjectModal`)

**Interfaces:**
- Consumes: `.tag-bracket`, `.modal-container`/`.modal-overlay` (Task 2).
- Produces: nothing new consumed elsewhere.

- [ ] **Step 1: Rewrite the injected modal content template**

Find (`js/app.js:151-193`, the `projectModalContent.innerHTML = \`...\`;` assignment):
```js
        const techBadges = data.tech.map(t => 
            `<span class="bg-secondary-fixed text-on-secondary-fixed-variant px-3 py-1 rounded-full font-label-sm text-[12px] font-semibold">${t}</span>`
        ).join(' ');
        
        const featuresList = data.features.map(f => 
            `<li class="flex items-start gap-2 text-sm text-on-surface-variant">
                <span class="material-symbols-outlined text-primary text-lg fill-icon mt-0.5">check_circle</span>
                <span>${f}</span>
            </li>`
        ).join('');
        
        projectModalContent.innerHTML = `
            <div class="flex flex-col gap-6">
                <!-- Zone d'image du projet -->
                <div class="h-48 md:h-64 rounded-xl overflow-hidden relative">
                    <img src="${data.image}" alt="${data.title}" class="w-full h-full object-cover">
                    <div class="absolute top-4 left-4 bg-primary text-white font-label-sm text-xs px-3 py-1 rounded-full">${data.category}</div>
                </div>
                <!-- Titre et badges technologiques -->
                <div class="flex flex-col gap-2">
                    <h2 class="font-headline-md text-xl md:text-headline-md text-on-surface font-extrabold">${data.title}</h2>
                    <div class="flex flex-wrap gap-2">${techBadges}</div>
                </div>
                <!-- Description complète -->
                <div class="flex flex-col gap-3">
                    <h4 class="text-xs font-bold text-primary uppercase tracking-wider">Description du projet</h4>
                    <p class="font-body-md text-sm text-on-surface-variant leading-relaxed">${data.description}</p>
                </div>
                <!-- Liste des fonctionnalités -->
                <div class="flex flex-col gap-3">
                    <h4 class="text-xs font-bold text-primary uppercase tracking-wider">Fonctionnalités clés</h4>
                    <ul class="flex flex-col gap-2">${featuresList}</ul>
                </div>
                <!-- Liens d'actions (Démo / Github) -->
                <div class="flex gap-4 border-t border-outline-variant/20 pt-4 mt-2">
                    ${data.demo !== '#' ? `<a href="${data.demo}" target="_blank" class="flex-1 inline-flex items-center justify-center bg-primary hover:bg-primary-container text-white py-3 rounded-lg font-label-sm text-sm font-semibold transition-all duration-300 gap-2"><span class="material-symbols-outlined text-base">link</span> Visiter le site</a>` : ''}
                    ${data.source !== '#' ? `<a href="${data.source}" target="_blank" class="flex-1 inline-flex items-center justify-center border border-primary text-primary hover:bg-primary/5 py-3 rounded-lg font-label-sm text-sm font-semibold transition-all duration-300 gap-2"><span class="material-symbols-outlined text-base">code</span> Code source</a>` : ''}
                </div>
            </div>
        `;
```
Replace with:
```js
        const techBadges = data.tech.map(t => `<span class="tag-bracket">${t}</span>`).join(' ');

        const featuresList = data.features.map(f =>
            `<li class="flex items-start gap-2 text-sm text-on-surface-variant">
                <span class="font-label-sm text-secondary mt-0.5">—</span>
                <span>${f}</span>
            </li>`
        ).join('');

        projectModalContent.innerHTML = `
            <div class="flex flex-col gap-6">
                <!-- Zone d'image du projet (couleur complète, voir spec §4) -->
                <div class="h-48 md:h-64 border border-on-surface overflow-hidden relative">
                    <img src="${data.image}" alt="${data.title}" class="w-full h-full object-cover">
                    <div class="absolute top-4 left-4 bg-on-surface text-background font-label-sm text-xs px-3 py-1">${data.category}</div>
                </div>
                <!-- Titre et badges technologiques -->
                <div class="flex flex-col gap-2">
                    <h2 class="font-display-lg text-xl md:text-headline-md text-on-surface font-extrabold">${data.title}</h2>
                    <div class="flex flex-wrap gap-3">${techBadges}</div>
                </div>
                <!-- Description complète -->
                <div class="flex flex-col gap-3">
                    <h4 class="font-label-sm text-xs font-bold text-secondary uppercase tracking-wider">Description du projet</h4>
                    <p class="text-sm text-on-surface-variant leading-relaxed">${data.description}</p>
                </div>
                <!-- Liste des fonctionnalités -->
                <div class="flex flex-col gap-3">
                    <h4 class="font-label-sm text-xs font-bold text-secondary uppercase tracking-wider">Fonctionnalités clés</h4>
                    <ul class="flex flex-col gap-2">${featuresList}</ul>
                </div>
                <!-- Liens d'actions (Démo / Github) -->
                <div class="flex gap-4 border-t border-on-surface pt-4 mt-2">
                    ${data.demo !== '#' ? `<a href="${data.demo}" target="_blank" class="flex-1 inline-flex items-center justify-center bg-primary hover:bg-primary-container text-white py-3 font-label-sm text-sm font-semibold transition-all duration-300 gap-2">Visiter le site →</a>` : ''}
                    ${data.source !== '#' ? `<a href="${data.source}" target="_blank" class="flex-1 inline-flex items-center justify-center border-2 border-primary text-primary hover:bg-primary/5 py-3 font-label-sm text-sm font-semibold transition-all duration-300 gap-2">Code source</a>` : ''}
                </div>
            </div>
        `;
```
(Dropped the Material Symbols icons on the feature-list bullets and the demo/code buttons — mono em-dash bullets and plain text buttons keep the icon-free editorial vocabulary consistent with the rest of the site.)

- [ ] **Step 2: Syntax check**

Run: `node --check js/app.js` — expected: pass.

- [ ] **Step 3: Manual check**

`npm run dev`, click any project row to open its modal. Confirm: full-color image (not desaturated) with a solid black category badge top-left, serif title, bracketed tech tags, description, feature list with em-dash bullets, and one or two full-width buttons at the bottom (black solid / black outline) depending on whether `demo`/`source` are set to `#`. Close via the × button and via clicking outside the panel.

- [ ] **Step 4: Commit** (only if user confirmed git usage)

```bash
git add js/app.js
git commit -m "feat(project-modal): editorial dossier-sheet template"
```

---

## Task 9: Contact section + Footer

**Files:**
- Modify: `index.html:702-883` (Contact section), `index.html:892-942` (Footer)

**Interfaces:**
- Consumes: `.tag-bracket`, `.glass-card`, `.form-input` (Task 2).
- Produces: nothing new consumed elsewhere. `#contact-email-link`, `#contact-location-text`, `#contact-github-link`, `#contact-linkedin-link`, `#footer-logo`, `#footer-copyright`, `#contact-form` and its field ids stay exactly as `renderContact()` (unchanged) and the submit handler expect.

- [ ] **Step 1: Restyle the email/location info cards**

Find (`index.html:719-765`):
```html
            <!-- Carte d'adresse e-mail -->
            <div class="glass-card rounded-xl p-6 flex items-center gap-4">
              <div
                class="w-12 h-12 bg-surface-container-high dark:bg-surface-variant rounded-lg flex items-center justify-center text-primary"
              >
                <span class="material-symbols-outlined text-2xl">mail</span>
              </div>
              <div>
                <div
                  class="text-xs font-semibold text-on-surface-variant uppercase tracking-wider"
                >
                  Email
                </div>
                <!-- Remplacez cette adresse par la vôtre -->
                <div class="text-sm font-bold text-on-surface">
                  <a
                    href="mailto: jdibangoup5@gmail.com"
                    class="hover:text-primary transition-all"
                    id="contact-email-link"
                    >jdibangoup5@gmail.com</a
                  >
                </div>
              </div>
            </div>

            <!-- Carte de localisation géographique -->
            <div class="glass-card rounded-xl p-6 flex items-center gap-4">
              <div
                class="w-12 h-12 bg-surface-container-high dark:bg-surface-variant rounded-lg flex items-center justify-center text-primary"
              >
                <span class="material-symbols-outlined text-2xl"
                  >location_on</span
                >
              </div>
              <div>
                <div
                  class="text-xs font-semibold text-on-surface-variant uppercase tracking-wider"
                >
                  Localisation
                </div>
                  <!-- Remplacez cette ville par la vôtre -->
                  <div class="text-sm font-bold text-on-surface" id="contact-location-text">
                    Abidjan, Côte d'Ivoire
                  </div>
              </div>
            </div>
```
Replace with:
```html
            <!-- Carte d'adresse e-mail -->
            <div class="glass-card p-6 flex flex-col gap-1">
              <div class="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                Email
              </div>
              <div class="text-sm font-bold text-on-surface">
                <a
                  href="mailto: jdibangoup5@gmail.com"
                  class="hover:text-secondary transition-all"
                  id="contact-email-link"
                  >jdibangoup5@gmail.com</a
                >
              </div>
            </div>

            <!-- Carte de localisation géographique -->
            <div class="glass-card p-6 flex flex-col gap-1">
              <div class="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                Localisation
              </div>
              <div class="text-sm font-bold text-on-surface" id="contact-location-text">
                Abidjan, Côte d'Ivoire
              </div>
            </div>
```

- [ ] **Step 2: Restyle the social links as bracket tags**

Find (`index.html:768-796`):
```html
            <div class="flex flex-col gap-3 px-2">
              <div
                class="text-xs font-bold text-on-surface-variant uppercase tracking-wider"
              >
                Me suivre
              </div>
              <div class="flex gap-3">
                <!-- Lien GitHub -->
                <a
                  class="w-10 h-10 border border-outline-variant/30 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-primary hover:border-primary transition-all duration-300"
                  href="#"
                  id="contact-github-link"
                  aria-label="GitHub"
                  ><span class="material-symbols-outlined fill-icon"
                    >code</span
                  ></a
                >
                <!-- Lien LinkedIn -->
                <a
                  class="w-10 h-10 border border-outline-variant/30 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-primary hover:border-primary transition-all duration-300"
                  href="#"
                  id="contact-linkedin-link"
                  aria-label="LinkedIn"
                  ><span class="material-symbols-outlined fill-icon"
                    >share</span
                  ></a
                >
              </div>
            </div>
```
Replace with:
```html
            <div class="flex flex-col gap-3 px-2">
              <div class="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                Me suivre
              </div>
              <div class="flex gap-4">
                <a class="tag-bracket" href="#" id="contact-github-link" aria-label="GitHub">github</a>
                <a class="tag-bracket" href="#" id="contact-linkedin-link" aria-label="LinkedIn">linkedin</a>
              </div>
            </div>
```

- [ ] **Step 3: Restyle the contact form fields (bottom-line style instead of bordered card fill)**

Find (each of the four `<input>`/`<textarea>` in `index.html:811-865` shares this class string):
```
w-full p-3 text-sm bg-background border border-outline-variant/30 rounded-lg text-on-background outline-none form-input
```
(there are 3 `<input>` occurrences and 1 `<textarea>` occurrence with the same class list, plus `min-h-[120px] resize-y` appended on the textarea only). Replace the shared class string on all four fields with:
```
w-full py-2 text-sm bg-transparent border-0 border-b-2 border-on-surface text-on-background outline-none form-input
```
(keep `min-h-[120px] resize-y` appended on the textarea as before). Do not change any `id`, `name`, `placeholder`, `required`, or `type` attribute.

- [ ] **Step 4: Simplify the submit button**

Find (`index.html:869-877`):
```html
              <button
                class="bg-primary hover:bg-primary-container text-white px-md py-3 rounded-lg font-label-sm text-label-sm font-semibold transition-all duration-300 w-full flex items-center justify-center gap-2 hover:scale-[1.01] btn-shimmer"
                type="submit"
              >
                <span class="material-symbols-outlined text-base fill-icon"
                  >send</span
                >
                Envoyer le message
              </button>
```
Replace with:
```html
              <button
                class="bg-primary hover:bg-primary-container text-white px-md py-3 font-label-sm text-label-sm font-semibold uppercase tracking-wide transition-all duration-300 w-full flex items-center justify-center gap-2"
                type="submit"
              >
                Envoyer le message →
              </button>
```
(The `submitBtn.innerHTML` swap in `js/app.js`'s contact-form submit handler, e.g. `'<span class="material-symbols-outlined animate-spin" ...>sync</span> Envoi en cours...'`, is left untouched — it's a transient loading state, out of scope, and the spinner icon still renders fine even without the send icon on the resting state.)

- [ ] **Step 5: Simplify the footer**

Find (`index.html:892-942`, the whole `<footer>`):
```html
    <footer
      class="full-width py-lg mt-xl border-t border-outline-variant/20 bg-surface dark:bg-surface-container-lowest"
    >
      <div
        class="flex flex-col md:flex-row justify-between items-center px-gutter max-w-container-max mx-auto gap-md"
      >
        <div
          class="font-display-lg text-body-lg font-bold text-on-surface dark:text-on-surface-variant"
          id="footer-logo"
        >
          DevPortfolio
        </div>
        <!-- Liens secondaires rapides du bas de page -->
        <ul class="flex flex-wrap justify-center gap-md">
          <li>
            <a
              class="font-label-sm text-label-sm text-on-surface-variant/70 hover:text-primary dark:hover:text-primary-fixed transition-colors opacity-80 hover:opacity-100 duration-300"
              href="#about"
              >À Propos</a
            >
          </li>
          <li>
            <a
              class="font-label-sm text-label-sm text-on-surface-variant/70 hover:text-primary dark:hover:text-primary-fixed transition-colors opacity-80 hover:opacity-100 duration-300"
              href="#skills"
              >Compétences</a
            >
          </li>
          <li>
            <a
              class="font-label-sm text-label-sm text-on-surface-variant/70 hover:text-primary dark:hover:text-primary-fixed transition-colors opacity-80 hover:opacity-100 duration-300"
              href="#projects"
              >Projets</a
            >
          </li>
          <li>
            <a
              class="font-label-sm text-label-sm text-on-surface-variant/70 hover:text-primary dark:hover:text-primary-fixed transition-colors opacity-80 hover:opacity-100 duration-300"
              href="#contact"
              >Contact</a
            >
          </li>
        </ul>
        <div
          class="font-body-md text-sm text-on-surface-variant/70 text-center md:text-right"
          id="footer-copyright"
        >
          © 2026 Jordan Portfolio. Conçu avec Précision & Clarté.
        </div>
      </div>
    </footer>
```
Replace with:
```html
    <footer class="full-width py-lg mt-xl border-t-2 border-on-surface bg-surface">
      <div
        class="flex flex-col md:flex-row justify-between items-center px-gutter max-w-container-max mx-auto gap-md"
      >
        <div
          class="font-label-sm text-label-sm uppercase tracking-wide font-bold text-on-surface"
          id="footer-logo"
        >
          DevPortfolio
        </div>
        <!-- Liens secondaires rapides du bas de page -->
        <ul class="flex flex-wrap justify-center gap-md">
          <li><a class="tag-bracket" href="#about">À Propos</a></li>
          <li><a class="tag-bracket" href="#skills">Compétences</a></li>
          <li><a class="tag-bracket" href="#projects">Projets</a></li>
          <li><a class="tag-bracket" href="#contact">Contact</a></li>
        </ul>
        <div
          class="font-label-sm text-label-sm text-on-surface-variant text-center md:text-right"
          id="footer-copyright"
        >
          © 2026 Jordan Portfolio. Conçu avec Précision & Clarté.
        </div>
      </div>
    </footer>
```

- [ ] **Step 6: Build and manual check**

Run: `npm run build:css` (exits 0).

`npm run dev`, scroll to "Me Contacter": email/location are plain bordered blocks with a red mono label, no icon squares; GitHub/LinkedIn are `[ github ]`/`[ linkedin ]` tags; the form fields show only a bottom black line (no box/border-all, no rounded corners); the submit button is solid black. Test the form once with valid data if you have working Web3Forms network access, otherwise just confirm client-side validation still fires (submit empty → toast error). Scroll to the footer — bracketed nav tags, mono copyright, thick black top rule.

- [ ] **Step 7: Commit** (only if user confirmed git usage)

```bash
git add index.html
git commit -m "feat(contact,footer): editorial info blocks, line-style form fields"
```

---

## Task 10: CV modal + Toast notifications

**Files:**
- Modify: `js/app.js:459-559` (`openCvModal`), `js/app.js:37-71` (`showToast`)

**Interfaces:**
- Consumes: `.tag-bracket`, `.modal-container` (Task 2), `.toast`/`.toast.success`/`.toast.error`/`.toast.info` (Task 2).
- Produces: nothing new consumed elsewhere. `#cv-modal-content`, `#download-pdf-btn`, `#toast-container` ids/behavior unchanged.

- [ ] **Step 1: Rewrite the CV modal content template**

Find (`js/app.js:465-559`, the `cvModalContent.innerHTML = \`...\`;` assignment and its three `.map()` helper consts above it):
```js
        const skillsBadges = cv.skills.map(s => 
            `<span class="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold">${s}</span>`
        ).join(' ');
        
        const languagesList = cv.languages.map(l => 
            `<li>${l}</li>`
        ).join('');
        
        const experiencesList = cv.experiences.map(exp => `
            <div class="flex flex-col gap-1">
                <div class="flex justify-between items-baseline gap-2">
                    <h5 class="font-bold text-on-surface text-sm">${exp.role}</h5>
                    <span class="text-primary text-xs font-bold shrink-0">${exp.dates}</span>
                </div>
                <span class="text-xs text-on-surface-variant italic">${exp.company}</span>
                <p class="text-xs text-on-surface-variant leading-relaxed mt-1">${exp.description}</p>
            </div>
        `).join('');
        
        const formationsList = cv.formations.map(f => `
            <div class="flex flex-col gap-1">
                <div class="flex justify-between items-baseline gap-2">
                    <h5 class="font-bold text-on-surface text-sm">${f.degree}</h5>
                    <span class="text-primary text-xs font-bold shrink-0">${f.dates}</span>
                </div>
                <span class="text-xs text-on-surface-variant">${f.school}</span>
            </div>
        `).join('');

        cvModalContent.innerHTML = `
            <div class="flex flex-col gap-5">
                <!-- En-tête du CV (Identité et objectif) -->
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/20 pb-4">
                    <div>
                        <h2 class="font-headline-md text-headline-md text-primary font-extrabold">${cv.identity.name}</h2>
                        <p class="text-sm font-semibold text-on-surface">${cv.identity.role}</p>
                        <p class="text-xs text-on-surface-variant">${cv.identity.availability}</p>
                    </div>
                    <!-- Bouton de téléchargement simulé -->
                    <button class="bg-primary hover:bg-primary-container text-white px-6 py-2.5 rounded-lg font-label-sm text-xs font-semibold flex items-center gap-2 transition-all duration-300 hover:scale-[1.05] active:scale-95 shadow-md btn-shimmer" id="download-pdf-btn">
                        <span class="material-symbols-outlined text-sm">download</span>
                        Télécharger le CV PDF
                    </button>
                </div>
                
                <!-- Grille principale du CV -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                    <!-- Colonne Gauche (Infos contact, compétences d'onglets, langues) -->
                    <div class="md:col-span-1 flex flex-col gap-6 bg-surface-container p-4 rounded-xl">
                        <!-- Contact -->
                        <div class="flex flex-col gap-2">
                            <h4 class="text-xs font-bold text-primary uppercase tracking-wider">Contact</h4>
                            <ul class="flex flex-col gap-1.5 text-xs text-on-surface-variant">
                                <li class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[14px]">mail</span> ${cv.contact.email}</li>
                                <li class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[14px]">phone</span> ${cv.contact.phone}</li>
                                <li class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[14px]">location_on</span> ${cv.contact.location}</li>
                            </ul>
                        </div>
                        <!-- Compétences du CV -->
                        <div class="flex flex-col gap-2">
                            <h4 class="text-xs font-bold text-primary uppercase tracking-wider">Compétences clés</h4>
                            <div class="flex flex-wrap gap-1.5">
                                ${skillsBadges}
                            </div>
                        </div>
                        <!-- Langues -->
                        <div class="flex flex-col gap-2">
                            <h4 class="text-xs font-bold text-primary uppercase tracking-wider">Langues</h4>
                            <ul class="flex flex-col gap-1 text-xs text-on-surface-variant">
                                ${languagesList}
                            </ul>
                        </div>
                    </div>
                    
                    <!-- Colonne Droite (Expériences & Études détaillées) -->
                    <div class="md:col-span-2 flex flex-col gap-5">
                        <!-- Expériences -->
                        <div class="flex flex-col gap-3">
                            <h4 class="text-sm font-bold text-on-surface uppercase tracking-wider border-b border-outline-variant/20 pb-1">Expériences Professionnelles</h4>
                            <div class="flex flex-col gap-4">
                                ${experiencesList}
                            </div>
                        </div>
                        
                        <!-- Formations -->
                        <div class="flex flex-col gap-3">
                            <h4 class="text-sm font-bold text-on-surface uppercase tracking-wider border-b border-outline-variant/20 pb-1">Formations</h4>
                            <div class="flex flex-col gap-3">
                                ${formationsList}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
```
Replace with:
```js
        const skillsBadges = cv.skills.map(s => `<span class="tag-bracket">${s}</span>`).join(' ');

        const languagesList = cv.languages.map(l => `<li>${l}</li>`).join('');

        const experiencesList = cv.experiences.map(exp => `
            <div class="flex flex-col gap-1">
                <div class="flex justify-between items-baseline gap-2">
                    <h5 class="font-bold text-on-surface text-sm">${exp.role}</h5>
                    <span class="font-label-sm text-secondary text-xs font-bold shrink-0 tabular-nums">${exp.dates}</span>
                </div>
                <span class="text-xs text-on-surface-variant italic">${exp.company}</span>
                <p class="text-xs text-on-surface-variant leading-relaxed mt-1">${exp.description}</p>
            </div>
        `).join('');

        const formationsList = cv.formations.map(f => `
            <div class="flex flex-col gap-1">
                <div class="flex justify-between items-baseline gap-2">
                    <h5 class="font-bold text-on-surface text-sm">${f.degree}</h5>
                    <span class="font-label-sm text-secondary text-xs font-bold shrink-0 tabular-nums">${f.dates}</span>
                </div>
                <span class="text-xs text-on-surface-variant">${f.school}</span>
            </div>
        `).join('');

        cvModalContent.innerHTML = `
            <div class="flex flex-col gap-5">
                <!-- En-tête du CV (Identité et objectif) -->
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-on-surface pb-4">
                    <div>
                        <h2 class="font-display-lg text-headline-md text-on-surface font-extrabold">${cv.identity.name}</h2>
                        <p class="text-sm font-semibold text-on-surface">${cv.identity.role}</p>
                        <p class="text-xs text-on-surface-variant">${cv.identity.availability}</p>
                    </div>
                    <!-- Bouton de téléchargement simulé -->
                    <button class="bg-primary hover:bg-primary-container text-white px-6 py-2.5 font-label-sm text-xs font-semibold uppercase tracking-wide flex items-center gap-2 transition-all duration-300" id="download-pdf-btn">
                        Télécharger le CV PDF
                    </button>
                </div>

                <!-- Grille principale du CV -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                    <!-- Colonne Gauche -->
                    <div class="md:col-span-1 flex flex-col gap-6 border border-on-surface p-4">
                        <div class="flex flex-col gap-2">
                            <h4 class="font-label-sm text-xs font-bold text-secondary uppercase tracking-wider">Contact</h4>
                            <ul class="flex flex-col gap-1.5 text-xs text-on-surface-variant">
                                <li>${cv.contact.email}</li>
                                <li>${cv.contact.phone}</li>
                                <li>${cv.contact.location}</li>
                            </ul>
                        </div>
                        <div class="flex flex-col gap-2">
                            <h4 class="font-label-sm text-xs font-bold text-secondary uppercase tracking-wider">Compétences clés</h4>
                            <div class="flex flex-wrap gap-2">
                                ${skillsBadges}
                            </div>
                        </div>
                        <div class="flex flex-col gap-2">
                            <h4 class="font-label-sm text-xs font-bold text-secondary uppercase tracking-wider">Langues</h4>
                            <ul class="flex flex-col gap-1 text-xs text-on-surface-variant">
                                ${languagesList}
                            </ul>
                        </div>
                    </div>

                    <!-- Colonne Droite -->
                    <div class="md:col-span-2 flex flex-col gap-5">
                        <div class="flex flex-col gap-3">
                            <h4 class="font-label-sm text-sm font-bold text-on-surface uppercase tracking-wider border-b border-on-surface pb-1">Expériences Professionnelles</h4>
                            <div class="flex flex-col gap-4">
                                ${experiencesList}
                            </div>
                        </div>
                        <div class="flex flex-col gap-3">
                            <h4 class="font-label-sm text-sm font-bold text-on-surface uppercase tracking-wider border-b border-on-surface pb-1">Formations</h4>
                            <div class="flex flex-col gap-3">
                                ${formationsList}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
```

- [ ] **Step 2: Rewrite the toast template**

Find (`js/app.js:44-55`):
```js
        // Sélection de l'icône Google Material appropriée
        let iconName = 'info';
        if (type === 'success') iconName = 'check_circle';
        if (type === 'error') iconName = 'error';
        
        // Structure interne de la notification toast
        toast.innerHTML = `
            <span class="material-symbols-outlined fill-icon ${
                type === 'success' ? 'text-green-500' : type === 'error' ? 'text-red-500' : 'text-primary'
            }">${iconName}</span>
            <div class="text-sm font-semibold text-on-surface">${message}</div>
        `;
```
Replace with:
```js
        // Label de statut mono (remplace l'icône Material colorée)
        let statusLabel = 'INFO';
        if (type === 'success') statusLabel = 'OK';
        if (type === 'error') statusLabel = 'ERREUR';

        toast.innerHTML = `
            <span class="font-label-sm text-label-sm font-bold ${
                type === 'success' ? 'text-green-600' : type === 'error' ? 'text-red-600' : 'text-on-surface'
            }">${statusLabel} —</span>
            <div class="text-sm text-on-surface">${message}</div>
        `;
```

- [ ] **Step 3: Syntax check**

Run: `node --check js/app.js` — expected: pass.

- [ ] **Step 4: Manual check**

`npm run dev`. Click "Mon CV" in the nav — modal shows serif name, bordered contact/skills/languages block on the left, experiences/formations with red mono dates on the right, solid black download button. Click the download button — confirm the 1.4s simulated-generation state still works and a success toast appears afterward, styled as a white bordered bar with a green `OK —` label (not an icon). Trigger an error toast too (e.g. submit the contact form empty) and confirm it shows a red `ERREUR —` label with a red left border.

- [ ] **Step 5: Commit** (only if user confirmed git usage)

```bash
git add js/app.js
git commit -m "feat(cv-modal,toast): editorial CV sheet, mono status toasts"
```

---

## Task 11: Full-site verification pass

**Files:** none modified — verification only.

**Interfaces:**
- Consumes: everything produced by Tasks 1–10.

- [ ] **Step 1: Rebuild and syntax-check everything one more time**

```bash
npm run build:css
node --check js/app.js
```
Both must succeed with no errors.

- [ ] **Step 2: Re-check the identifier contract from spec §7**

```bash
grep -c 'id="navbar"\|id="scroll-progress"\|id="nav-logo"\|id="menu-toggle"\|id="mobile-nav-overlay"\|id="hero"\|id="hero-availability"\|id="hero-title"\|id="hero-description"\|id="hero-img"\|id="hero-badge-1"\|id="hero-badge-2"\|id="about-story-title"\|id="about-paragraphs"\|id="about-journey-1"\|id="about-journey-2"\|id="about-education-container"\|id="about-values-container"\|id="skills"\|id="skills-categories-container"\|id="projects-grid"\|id="project-modal"\|id="close-project-modal"\|id="project-modal-content"\|id="cv-btn"\|id="cv-modal"\|id="close-cv-modal"\|id="cv-modal-content"\|id="contact-email-link"\|id="contact-location-text"\|id="contact-github-link"\|id="contact-linkedin-link"\|id="footer-logo"\|id="footer-copyright"\|id="contact-form"\|id="form-name"\|id="form-email"\|id="form-subject"\|id="form-message-text"\|id="form-message"\|id="toast-container"' index.html
```
Expected: `38` (one match per id — if lower, an id was accidentally renamed or deleted; find and restore it before continuing).

Run: `grep -c 'mouse-glow\|parallax-bg' index.html js/app.js css/*.css`
Expected: `0` in every file (confirms the intentionally-removed decorative elements and their JS/CSS are fully gone, not half-removed).

- [ ] **Step 3: Full manual walkthrough**

`npm run dev`, open `http://localhost:3000` and go through, in order: Hero (status dot pulses, CTA buttons work, portrait is B&W) → nav numbered links scroll to each section → About tabs switch content → Skills bars animate on scroll → Projects filter + row click opens modal with color image → CV modal opens and download simulates → Contact form validates and (network permitting) submits → Footer links scroll correctly → resize to mobile width and open the burger menu.

- [ ] **Step 4: Accessibility spot-check (spec §9)**

- Tab through the page with keyboard only: every link/button/form field should show a visible focus outline (the browser default outline is not removed anywhere in this plan — confirm no CSS added an `outline: none` without a replacement).
- In devtools, toggle "emulate prefers-reduced-motion: reduce" — reveal animations should snap instantly, the status-dot pulse ring should stop (per the rule added in Task 2 Step 4).
- Resize to ~375px width — confirm nav links, filter tabs, and footer tags remain individually tappable (no overlapping hit areas).

- [ ] **Step 5: Report to the user**

Summarize: build/syntax checks passed, identifier contract intact (38/38), decorative mouse-glow/parallax code fully removed, manual walkthrough completed. If git commits were deferred pending user confirmation (Global Constraints), remind them the working tree has uncommitted changes across `index.html`, `tailwind.config.js`, `css/*.css`, `js/app.js`, and ask again whether/how they want it committed.
