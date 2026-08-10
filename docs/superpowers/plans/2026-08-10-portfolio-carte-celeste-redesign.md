# Portfolio "Carte Céleste" Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transpose the validated "Carte Céleste" prototype (fusion of the "Constellation" and "Itinéraire" comparison directions) into the real portfolio codebase, replacing the Material-You violet/glassmorphic look with a dark navy/gold "night-sky navigation" identity, while preserving `js/portfolio-data.js`'s schema and every DOM id `js/app.js` depends on.

**Architecture:** Pure CSS/HTML/vanilla-JS site, no build step beyond the existing Tailwind CLI (`npm run build:css`). Visual identity moves from Tailwind Material-Design-3 utility classes to bespoke CSS classes (defined in the existing modular `css/*.css` files) driven by a small set of CSS custom properties. `js/app.js`'s `render*()` functions keep their exact signatures and DOM contract; only their generated HTML strings change. Material Symbols (icon font) and Google Fonts (Inter/Plus Jakarta Sans) are dropped in favor of inline SVG icons and a self-hosted Space Grotesk.

**Tech Stack:** Vanilla HTML/CSS/JS, Tailwind CLI (existing build, untouched by this plan), no new dependencies.

## Global Constraints

- `js/portfolio-data.js` — schema never changes shape. Every task reads fields exactly as they exist today.
- Full identifier contract (all `id`s `app.js` targets) must keep working — see the plan's spec, §7, for the authoritative list. No `id` is renamed.
- Colors (from the spec, §3.1): `--bg:#0F1B2E`, `--bg-2:#16273D`, `--bg-3:#1D3049`, `--ink:#F3F1E8`, `--ink-70:rgba(243,241,232,.72)`, `--ink-45:rgba(243,241,232,.52)`, `--line:rgba(243,241,232,.14)`, `--accent:#E8A23C`, `--accent-ink:#F0B65E`.
- One border-radius scale, three steps, no other values: `6px` on elements nested inside a larger card (an inner image viewport, a small tag chip), `10px` on small standalone controls (icon buttons, form inputs, toasts), `var(--radius)` (`14px`) on cards/panels/main containers, `999px` on pills/buttons/badges. (Corrected from an earlier draft that stated only two steps; Tasks 1-2's actual CSS already consistently used this three-step pattern — this line just documents it accurately so later tasks and reviewers don't flag it as drift.)
- No box-shadow, no `backdrop-filter`/glassmorphism anywhere (flat dark surfaces only).
- `tailwind.config.js` is **not modified** by this plan — no component relies on its color-key utilities anymore; every touched element gets a bespoke class instead (this refines spec §8's wording, which described a Tailwind color-key remap; rewriting markup with dedicated classes is more precise and was chosen after reading the actual codebase during planning — behavior and visual outcome are unaffected).
- Every animation gates on `prefers-reduced-motion` exactly as the existing `app.js` code already does (a single `prefersReducedMotion` const near the top of the `DOMContentLoaded` handler).
- After any task that changes Tailwind-relevant class usage in `index.html`/`js/app.js` (rare in this plan, but check every task): run `npm run build:css` and commit the regenerated `css/tailwind-build.css`. Most tasks in this plan do **not** touch Tailwind-recognized utility classes (they introduce new bespoke classes instead) — each task explicitly states whether a rebuild is needed.

---

## File Map

| File | Change |
|---|---|
| `index.html` | Rewritten section by section (Tasks 1-9): head `<link>`s, `<body>` class, nav, hero, about, skills, projects, contact, footer, modals |
| `js/app.js` | `render*()` template strings rewritten (Tasks 3-9); new icon-toggle logic for mobile menu (Task 2); new star-canvas function (Task 3); `#3 FORÇAGE DU MODE CLAIR` block simplified (Task 1) |
| `js/icons.js` (new) | Inline SVG icon library + `renderIcon()` helper, loaded before `app.js` (Task 1) |
| `css/fonts/space-grotesk-600.woff2`, `css/fonts/space-grotesk-700.woff2` (new) | Self-hosted font files (Task 1) |
| `css/style.css` | `@font-face` rules + import order (Task 1) |
| `css/glass.css` | Rewritten: `:root` design tokens replace the old glassmorphism rules (Task 1) |
| `css/animations.css` | Adjusted: `.icon-spin` keyframe added, dead halo/parallax keyframes removed (Task 1) |
| `css/scrollbar.css` | Recolored (Task 1) |
| `css/components.css` | Rewritten: masthead/nav, rubriques, timeline entries, value cards, skill legend, project "stop" cards, form fields (Tasks 2, 4, 5, 6, 8) |
| `css/overlays.css` | Rewritten: mobile overlay, modals ("fiche d'étape", CV sheet), toasts (Tasks 2, 7, 9) |
| `css/utilities.css` | `.scroll-progress-bar` recolored, `.mouse-glow` removed, star-canvas positioning added (Tasks 1, 3) |
| `css/layout.css` | Untouched (disabled timeline section, out of scope) |

---

### Task 1: Foundations — tokens, fonts, icon library, dead-code removal

**Files:**
- Modify: `css/glass.css` (full rewrite)
- Modify: `css/style.css:1-24` (add `@font-face` import)
- Modify: `css/animations.css` (add `.icon-spin`, remove unused halo/parallax keyframes if present)
- Modify: `css/scrollbar.css` (recolor)
- Create: `css/fonts/space-grotesk-600.woff2`, `css/fonts/space-grotesk-700.woff2`
- Create: `js/icons.js`
- Modify: `index.html:1,13,35-57,995` (html class, head `<link>`s, add `<script src="js/icons.js">` before `app.js`)
- Modify: `js/app.js:73-81` (simplify the forced-light-mode block)

**Interfaces:**
- Produces: CSS custom properties `--bg`, `--bg-2`, `--bg-3`, `--ink`, `--ink-70`, `--ink-45`, `--line`, `--accent`, `--accent-ink`, `--radius` (available globally from `css/glass.css`, loaded first via `style.css`). `renderIcon(name, extraClass)` global function from `js/icons.js`, returning an SVG markup string, or `''` if `name` is unknown. `.icon` base class (sized `1em` square, inherits `currentColor`). `.icon-spin` class (continuous rotation, respects no override needed since only applied transiently during network calls).
- Consumes: nothing from other tasks (this is the foundation task).

- [ ] **Step 1: Download the self-hosted Space Grotesk font files**

Run from the repo root (`Portofolio/`):

```bash
mkdir -p css/fonts
curl -s -o css/fonts/space-grotesk-600.woff2 "https://fonts.gstatic.com/s/spacegrotesk/v22/V8mDoQDjQSkFtoMM3T6r8E7mPbF4Cw.woff2"
curl -s -o css/fonts/space-grotesk-700.woff2 "https://fonts.gstatic.com/s/spacegrotesk/v22/V8mDoQDjQSkFtoMM3T6r8E7mPbF4Cw.woff2"
```

Both weights resolve to the same variable-font file at this Google Fonts version (confirmed by inspecting the served `@font-face` rules for `family=Space+Grotesk:wght@600;700` — both weight declarations point at the identical URL). Downloading it twice under two names keeps the two `@font-face` declarations below symmetric and easy to reason about; it is not a mistake.

Verify both files are non-empty:

```bash
ls -la css/fonts/space-grotesk-600.woff2 css/fonts/space-grotesk-700.woff2
```

Expected: both files exist with a size in the 20-40 KB range (not 0 bytes — a 0-byte file means the download failed, e.g. no network access; if that happens, retry once, and if it still fails report BLOCKED rather than committing an empty font file).

- [ ] **Step 2: Rewrite `css/glass.css` as the design-tokens file**

Replace the entire file content with:

```css
/* ==========================================================================
   GLASS.CSS — DESIGN TOKENS ("Carte Céleste")
   ==========================================================================
   Despite the filename (kept to avoid touching style.css's import list),
   this file now defines the global CSS custom properties for the dark
   navy / gold "night sky" identity, replacing the old Material-You
   glassmorphism rules. No .glass/.glass-card rules remain — nothing in
   the redesigned markup depends on them.
*/

:root {
    --bg: #0F1B2E;
    --bg-2: #16273D;
    --bg-3: #1D3049;
    --ink: #F3F1E8;
    --ink-70: rgba(243, 241, 232, .72);
    --ink-45: rgba(243, 241, 232, .52);
    --line: rgba(243, 241, 232, .14);
    --accent: #E8A23C;
    --accent-ink: #F0B65E;
    --radius: 14px;
}

html, body {
    background: var(--bg);
    color: var(--ink);
}

.icon {
    width: 1em;
    height: 1em;
    display: inline-block;
    vertical-align: -0.125em;
    flex: none;
}
```

- [ ] **Step 3: Add the `@font-face` rules and import them from `style.css`**

Create the font-face rules inline at the top of `css/style.css` (before the existing `@import` lines), so no new file/import wiring is needed:

```css
/* ==========================================================================
   STYLE.CSS — POINT D'ENTRÉE PRINCIPAL DES STYLES PERSONNALISÉS
   ==========================================================================
   Ce fichier importe tous les modules CSS du projet dans l'ordre correct.
   Pour modifier un style, ouvrez directement le fichier thématique concerné :

   ┌─ glass.css       → Design tokens (:root) — plus de glassmorphism
   ├─ animations.css  → Toutes les animations & keyframes
   ├─ scrollbar.css   → Barre de défilement personnalisée
   ├─ components.css  → Onglets, jauges, cartes projets, formulaires
   ├─ layout.css      → Frise chronologique (Timeline)
   ├─ overlays.css    → Menu mobile, modales, toasts
   └─ utilities.css   → Barre de progression, canvas d'étoiles
   ==========================================================================
*/

@import url('./glass.css');
@import url('./animations.css');
@import url('./scrollbar.css');
@import url('./components.css');
@import url('./layout.css');
@import url('./overlays.css');
@import url('./utilities.css');

@font-face {
    font-family: 'Space Grotesk';
    font-weight: 600;
    font-style: normal;
    font-display: swap;
    src: url('./fonts/space-grotesk-600.woff2') format('woff2');
}

@font-face {
    font-family: 'Space Grotesk';
    font-weight: 700;
    font-style: normal;
    font-display: swap;
    src: url('./fonts/space-grotesk-700.woff2') format('woff2');
}
```

**Ordering matters here and is not arbitrary:** per the CSS spec, `@import` rules are only valid when they appear at the very top of the stylesheet (only `@charset` may precede them) — any other rule before an `@import`, including `@font-face`, makes that `@import` (and everything after the first violation) invalid in strict engines. The `@import` block must stay first; `@font-face` goes after it. (An earlier draft of this step had this backwards — corrected here.)

- [ ] **Step 4: Add `.icon-spin` and remove now-orphaned keyframes from `css/animations.css`**

Read `css/animations.css` first to see its exact current keyframe list. Add this rule (append at the end of the file):

```css

/* ==========================================================================
   ICÔNES EN ROTATION (spinner de chargement, remplace animate-spin Tailwind)
   ========================================================================== */
@keyframes icon-spin {
    to { transform: rotate(360deg); }
}
.icon-spin {
    animation: icon-spin 0.9s linear infinite;
}
@media (prefers-reduced-motion: reduce) {
    .icon-spin { animation: none; }
}
```

Then search the file for any keyframe used exclusively by `.mouse-glow`/`.parallax-bg`/`.parallax-bg-bottom` (e.g. a `pulse`-like glow animation scoped to those classes only — check by grepping `mouse-glow\|parallax` across `css/*.css` first). If such a keyframe exists and nothing else references it, delete it. If `.mouse-glow`/`.parallax-bg` styling lives only in `css/utilities.css` (confirmed in Task 3, which removes it there) and `animations.css` has no dedicated keyframe for them, make no further change here.

- [ ] **Step 5: Recolor `css/scrollbar.css`**

Read the file first. Replace every literal color value (hex or `rgb()`) with the matching token from Step 2 (`var(--bg-2)` for the track, `var(--line)` or `var(--accent)` for the thumb — pick `var(--line)` at rest and `var(--accent)` on `:hover` if the file has a hover rule; otherwise a flat `var(--line)` thumb is sufficient). Do not change the file's structure (selectors, `-webkit-scrollbar` pseudo-elements), only its color values.

- [ ] **Step 6: Create the icon library `js/icons.js`**

```js
/* ==========================================================================
   ICONS.JS — BIBLIOTHÈQUE D'ICÔNES SVG EN LIGNE
   ==========================================================================
   Remplace Google Material Symbols (retiré du <head>, voir index.html).
   Chaque entrée est un <svg> complet, viewBox 24x24, sans classe ni taille
   fixe (la taille vient de .icon en CSS, voir css/glass.css).
   Usage : renderIcon('mail') ou renderIcon('mail', 'text-lg') pour une
   classe additionnelle.
*/
const ICONS = {
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="4.5" width="20" height="15" rx="1"/><path d="m3 6 9 7 9-7"/></svg>',
    location: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7-6.5-7-11.5A7 7 0 0 1 19 9.5C19 14.5 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.3"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v4a2 2 0 0 1-2 2C9.5 21 3 14.5 3 6a2 2 0 0 1 1-2Z"/></svg>',
    code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="8 6 2 12 8 18"/><polyline points="16 6 22 12 16 18"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><line x1="8.3" y1="10.7" x2="15.7" y2="6.3"/><line x1="8.3" y1="13.3" x2="15.7" y2="17.7"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 14a4 4 0 0 0 5.66 0l2.83-2.83a4 4 0 1 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0L5.5 12.83a4 4 0 1 0 5.66 5.66l1-1"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="21" y1="3" x2="10" y2="14"/><polygon points="21 3 14 21 10 14 3 10 21 3"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" opacity=".16"/><path d="m8.5 12.5 2.3 2.3 4.7-5.1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" opacity=".16"/><line x1="12" y1="7.5" x2="12" y2="13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="16.3" r="1.1"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" opacity=".16"/><circle cx="12" cy="7.8" r="1.1"/><line x1="12" y1="11" x2="12" y2="16.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 19h16"/></svg>',
    sync: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12a9 9 0 0 1 15.3-6.4L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.3 6.4L3 16"/><path d="M3 21v-5h5"/></svg>',
    palette: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2a4 4 0 0 0 4-4c0-4.4-4-7.4-9-7.4Z"/><circle cx="7.5" cy="10.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="11" cy="7.2" r="1.1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="8.5" r="1.1" fill="currentColor" stroke="none"/></svg>',
    database: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg>',
    smartphone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="6" y="2" width="12" height="20" rx="2"/><line x1="10" y1="18" x2="14" y2="18"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5 14.8 9l7 .6-5.3 4.6 1.6 6.8L12 17.6 5.9 21l1.6-6.8L2.2 9.6l7-.6L12 2.5Z"/></svg>'
};

function renderIcon(name, extraClass) {
    const svg = ICONS[name];
    if (!svg) return '';
    const classes = extraClass ? `icon ${extraClass}` : 'icon';
    return svg.replace('<svg ', `<svg class="${classes}" `);
}
```

- [ ] **Step 7: Wire the new font, drop Google Fonts/Material Symbols, load `icons.js`**

In `index.html`:

1. Line 13 — change `<html class="light scroll-smooth" lang="fr">` to `<html class="scroll-smooth" lang="fr">` (drop `light`; no `dark` class is added, there is no theme toggle — see spec §1).
2. Lines 45-57 — delete the entire block (the two `preconnect` links, the Inter/Plus Jakarta Sans `<link>`, and the Material Symbols `<link>`). Nothing replaces it in `<head>` — the font is now loaded via `@font-face` from `css/style.css` (already linked at line 75) and icons are inline SVG.
3. Just before `<script src="js/app.js"></script>` (line 995), add:

```html
    <script src="js/icons.js"></script>
```

so `js/icons.js` loads (and defines `ICONS`/`renderIcon`) before `js/app.js` runs.

- [ ] **Step 8: Apply the new font family to headings**

Add one rule to the bottom of `css/glass.css` (from Step 2), so it lives next to the `@font-face`-consuming tokens:

```css
h1, h2, h3, .nav-brand, .nav-cta, .btn {
    font-family: 'Space Grotesk', -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;
    font-weight: 700;
}
```

(`.nav-brand`, `.nav-cta`, `.btn` are classes introduced by Task 2; this rule is harmless before they exist and takes effect once Task 2 adds them. Body text keeps the system font stack — no rule needed, it already falls back correctly once Tailwind's `font-body-md`/`font-label-sm` Tailwind classes are removed from the markup in later tasks. Until then, existing `font-body-md`/`font-label-sm` Tailwind classes still resolve to `Inter`/`Plus Jakarta Sans` per `tailwind.config.js` — but those fonts are no longer loaded (Step 7 removed the `<link>`), so they silently fall back to the browser default sans-serif until each task removes those utility classes from its section. This is expected and harmless: no console error, just a temporary fallback font on not-yet-migrated sections between now and Task 9.)

- [ ] **Step 9: Simplify the forced-light-mode block in `js/app.js`**

Replace lines 73-81:

```js
    /* ==========================================================================
       3. FORÇAGE DU MODE CLAIR UNIQUEMENT (DESACTIVATION DU MODE SOMBRE)
       ========================================================================== 
       Cette section assure que le site s'exécute toujours avec le thème clair d'origine.
       Elle nettoie également les anciennes préférences enregistrées pour éviter les conflits.
    */
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    localStorage.removeItem('theme');
```

with:

```js
    /* ==========================================================================
       3. THÈME UNIQUE (aucune bascule clair/sombre)
       ========================================================================== 
       Le site n'a qu'un seul thème (nuit/or, défini par les tokens CSS de
       glass.css) : aucune classe 'light'/'dark' n'est nécessaire sur <html>.
       Nettoie toute ancienne préférence enregistrée par une version antérieure.
    */
    localStorage.removeItem('theme');
```

- [ ] **Step 10: Visual smoke test**

Since there is no automated test suite for this static site, verify manually:

```bash
python -m http.server 8600
```

Open `http://localhost:8600/index.html` in a browser. Expected: page background is dark navy (`#0F1B2E`), no console errors (check DevTools console specifically for `ICONS is not defined` or 404s on the font files or the old Google Fonts links), the page is otherwise visually unchanged in layout (all sections still use their pre-existing Tailwind Material-You classes until later tasks touch them — only the page background/font/icons infrastructure changed). Stop the server after checking.

- [ ] **Step 11: Commit**

```bash
git add css/glass.css css/style.css css/animations.css css/scrollbar.css css/fonts/ js/icons.js index.html js/app.js
git commit -m "feat: dark navy/gold design tokens, self-hosted font, inline icon library"
```

No `tailwind-build.css` rebuild needed this task (no Tailwind-recognized utility class was added or removed — only raw CSS files, a new JS file, and `<head>`/`<html>` markup untouched by Tailwind's content scan changed).

---

### Task 2: Navigation (masthead) + mobile menu

**Files:**
- Modify: `index.html:91-225` (navbar, mobile overlay)
- Modify: `css/components.css` (new nav/mobile-overlay rules, replacing §1 tab-btn section is NOT here — that's Task 4; this task only touches nav-specific rules, appended)
- Modify: `css/overlays.css:17-39` (`.mobile-nav-overlay`, recolor + restructure)
- Modify: `css/utilities.css:9-30` (`.scroll-progress-bar`, recolor)
- Modify: `js/app.js:781-801` (mobile menu icon toggle — swap `textContent` ligature logic for `innerHTML` SVG swap)

**Interfaces:**
- Consumes: `renderIcon()` from Task 1 (`js/icons.js`).
- Produces: `.nav-masthead` (nav bar), `.nav-brand`, `.nav-link`, `.nav-cta` classes for later tasks/visual consistency reference (no other task depends on these directly, but Task 1's Step 8 font rule already references `.nav-brand`/`.nav-cta`).

- [ ] **Step 1: Rewrite the navbar markup**

Replace `index.html` lines 91-174 (the entire `<nav>` element) with:

```html
    <nav class="nav-masthead" id="navbar">
      <div class="nav-inner">
        <a class="nav-brand" href="#hero" id="nav-logo">
          ${''}<!-- placeholder removed below, real content is injected by renderHero() -->
        </a>

        <ul class="nav-links hidden md:flex">
          <li><a class="nav-link" href="#about">À Propos</a></li>
          <li><a class="nav-link" href="#skills">Compétences</a></li>
          <li><a class="nav-link" href="#projects">Projets</a></li>
          <li><a class="nav-link" href="#contact">Contact</a></li>
        </ul>

        <div class="nav-actions flex items-center gap-4">
          <a class="nav-cta hidden md:inline-flex" id="cv-btn">Mon CV</a>
          <button class="nav-menu-toggle md:hidden" id="menu-toggle" aria-label="Menu Mobile">
            <span id="menu-toggle-icon"></span>
          </button>
        </div>
      </div>
      <div class="scroll-progress-bar" id="scroll-progress"></div>
    </nav>
```

Remove the placeholder comment line (`${''}<!-- ... -->`) — it was a note to self, not real markup; the `<a id="nav-logo">` element should be empty (`<a class="nav-brand" href="#hero" id="nav-logo"></a>`), its content is set entirely by `renderHero()` in `js/app.js` (unchanged logic, line 242-245).

`hidden md:flex` / `md:hidden` / `md:inline-flex` / `flex items-center gap-4` are Tailwind **layout** utilities (display/responsive/gap — not color), kept as-is; they need no config remap and continue to compile correctly from the untouched `tailwind.config.js`.

- [ ] **Step 2: Rewrite the mobile overlay markup**

Replace `index.html` lines 183-225 (the `<div class="mobile-nav-overlay">`) with:

```html
    <div class="mobile-nav-overlay" id="mobile-nav-overlay">
      <ul class="flex flex-col gap-6 items-center text-center">
        <li><a class="mobile-nav-link" href="#about">À Propos</a></li>
        <li><a class="mobile-nav-link" href="#skills">Compétences</a></li>
        <li><a class="mobile-nav-link" href="#projects">Projets</a></li>
        <li><a class="mobile-nav-link" href="#contact">Contact</a></li>
      </ul>
    </div>
```

(`flex flex-col gap-6 items-center text-center` are layout-only Tailwind utilities, kept.)

- [ ] **Step 3: Add nav CSS to `css/components.css`**

Append to the end of `css/components.css`:

```css

/* ==========================================================================
   6. MASTHEAD DE NAVIGATION ("Carte Céleste")
   ========================================================================== */
.nav-masthead {
    position: sticky;
    top: 0;
    z-index: 50;
    height: 80px;
    display: flex;
    align-items: center;
    background: rgba(15, 27, 46, .88);
    backdrop-filter: none;
    border-bottom: 1px solid var(--line);
    transition: height 0.3s ease;
}
.nav-masthead.h-16 {
    height: 64px;
}
.nav-inner {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    height: 100%;
}
.nav-brand {
    font-size: 15px;
    font-weight: 700;
    color: var(--ink);
    text-decoration: none;
    white-space: nowrap;
}
.nav-links {
    align-items: center;
    gap: 28px;
    font-size: 13.5px;
    font-weight: 600;
}
.nav-link {
    color: var(--ink-70);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    padding-bottom: 2px;
    transition: color .2s, border-color .2s;
}
.nav-link:hover {
    color: var(--ink);
    border-color: var(--accent);
}
.nav-cta {
    font-size: 13px;
    font-weight: 700;
    padding: 9px 18px;
    border-radius: 999px;
    background: var(--accent);
    color: var(--bg);
    white-space: nowrap;
    text-decoration: none;
    cursor: pointer;
    transition: background .2s;
}
.nav-cta:hover {
    background: var(--accent-ink);
}
.nav-menu-toggle {
    width: 40px;
    height: 40px;
    border: 1px solid var(--line);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ink);
    background: none;
    cursor: pointer;
}
.nav-menu-toggle .icon {
    width: 20px;
    height: 20px;
}
```

- [ ] **Step 4: Rewrite `.mobile-nav-overlay` in `css/overlays.css`**

Replace lines 17-39 with:

```css
/* ==========================================================================
   1. MENU MOBILE PLEIN ÉCRAN (OVERLAY)
   ==========================================================================
   Gère l'arrière-plan masqué par défaut qui recouvre l'écran lors du clic
   sur l'icône burger des smartphones, avec une animation de fondu d'opacité.
*/

.mobile-nav-overlay {
    position: fixed;
    inset: 0;
    background-color: var(--bg);
    z-index: 49;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.mobile-nav-overlay.active {
    opacity: 1;
    pointer-events: all;
}

.mobile-nav-link {
    font-size: 22px;
    font-weight: 700;
    font-family: 'Space Grotesk', -apple-system, sans-serif;
    color: var(--ink);
    text-decoration: none;
}

.mobile-nav-link:hover {
    color: var(--accent);
}
```

- [ ] **Step 5: Recolor `.scroll-progress-bar` in `css/utilities.css`**

Replace lines 16-30:

```css
.scroll-progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    width: 0%;
    background: var(--accent);
    transition: width 0.1s ease-out;
    z-index: 100;
}
```

(Drop the `html.dark .scroll-progress-bar` rule entirely — there is no `.dark` class anywhere anymore.)

- [ ] **Step 6: Fix the navbar-shrink class toggle in `js/app.js`**

The existing shrink logic (§10, around line 660-671) already toggles `shadow-md`/`h-16`/`h-20` — but `.nav-masthead` in Step 3 uses its own `.h-16` rule and no `shadow-md`/`h-20` classes exist anymore (height defaults to 80px unshrunk). Replace lines 660-671:

```js
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('h-16', window.scrollY > 40);
        });
    }
```

- [ ] **Step 7: Swap the mobile-menu icon-toggle logic from ligature text to SVG**

Replace `js/app.js` lines 781-801 (the whole "14. COMPORTEMENT DU MENU MOBILE OVERLAY" block):

```js
    /* ==========================================================================
       14. COMPORTEMENT DU MENU MOBILE OVERLAY
       ========================================================================== 
       Gère l'affichage plein écran réactif du menu de navigation pour les smartphones.
    */
    const menuToggleBtn = document.getElementById('menu-toggle');
    const menuToggleIcon = document.getElementById('menu-toggle-icon');
    const mobileNavOverlay = document.getElementById('mobile-nav-overlay');

    if (menuToggleBtn && mobileNavOverlay) {
        if (menuToggleIcon) menuToggleIcon.innerHTML = renderIcon('menu');

        const toggleMobileNav = () => {
            const isOpened = mobileNavOverlay.classList.toggle('active');
            if (menuToggleIcon) menuToggleIcon.innerHTML = renderIcon(isOpened ? 'close' : 'menu');
            document.body.style.overflow = isOpened ? 'hidden' : 'auto';
        };

        menuToggleBtn.addEventListener('click', toggleMobileNav);

        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', toggleMobileNav);
        });
    }
```

- [ ] **Step 8: Visual check**

Serve the site (`python -m http.server 8600`), open in a browser:
- Confirm the nav bar shows the dark masthead, "Mon CV" pill button in gold, and that scrolling down shrinks its height (80px → 64px).
- Resize the viewport under 768px (or use DevTools device toolbar), click the burger icon: confirm it switches to an "X" and the full-screen dark overlay appears with the 4 nav links; click a link and confirm the overlay closes and the icon reverts to the burger.
- Confirm no console errors.

- [ ] **Step 9: Commit**

```bash
git add index.html css/components.css css/overlays.css css/utilities.css js/app.js
git commit -m "feat: restyle navigation as dark masthead with inline SVG menu icon"
```

No `tailwind-build.css` rebuild needed (only layout-utility Tailwind classes remain in the touched markup, already compiled).

---

### Task 3: Hero — star canvas, coordinates, postcard portrait

**Files:**
- Modify: `index.html:239-355` (entire `<section id="hero">`)
- Modify: `css/components.css` (hero rules, appended)
- Modify: `css/utilities.css` (remove `.mouse-glow`, position the new canvas)
- Modify: `js/app.js` (new star-canvas function; remove the mouse-glow listener block; `renderHero()` gets one addition — see Step 5)

**Interfaces:**
- Consumes: `renderIcon()` (Task 1), `.icon` class (Task 1).
- Produces: `#hero-canvas` (new canvas element, id only referenced by the new JS in this task), `.hero-badges` container holding `#hero-badge-1`/`#hero-badge-2` (unchanged ids, new visual treatment).

- [ ] **Step 1: Rewrite the hero markup**

Replace `index.html` lines 239-355 (the entire `<section id="hero">`) with:

```html
      <section class="hero" id="hero">
        <canvas id="hero-canvas" aria-hidden="true"></canvas>
        <div class="hero-inner">
          <div class="hero-copy">
            <div class="hero-coord mono">
              ${renderIcon('location')}
              Abidjan, Côte d'Ivoire · 05.36°N 04.01°O
            </div>

            <div class="hero-status">
              <span class="hero-status-dot"></span>
              <span id="hero-availability">Disponible pour un stage</span>
            </div>

            <h1 class="hero-title" id="hero-title">
              Concevoir l'Avenir,<br />
              <span>Une Ligne de Code à la Fois.</span>
            </h1>

            <p class="hero-desc" id="hero-description">
              Étudiant passionné en Génie Informatique, IA et Data-science. Je combine logique technique et créativité pour créer des expériences marquantes.
            </p>

            <div class="hero-cta-row">
              <a class="btn btn-primary" href="#projects">Voir mes projets</a>
              <a class="btn btn-ghost" href="#contact">Contact</a>
            </div>
          </div>

          <div class="hero-visual">
            <div class="postcard">
              <div class="postcard-viewport">
                <img alt="Portrait de l'étudiant" id="hero-img" src="images/jordan-portrait.jpg" />
              </div>
              <div class="postcard-tag mono">Point de départ</div>
            </div>
            <div class="hero-badges">
              <div class="hero-badge"><span id="hero-badge-1">Développeur Web</span></div>
              <div class="hero-badge"><span id="hero-badge-2">Développeur Mobile</span></div>
            </div>
          </div>
        </div>
      </section>
```

Notes:
- `${renderIcon('location')}` is **not** literal JS template-string syntax usable in static HTML — it is written here only to specify which icon belongs at that spot. Replace it in the actual file with the literal SVG markup by hand-expanding `renderIcon('location')`'s known output (copy the `location` entry's SVG string from `js/icons.js` verbatim, wrapped exactly as `renderIcon` would produce it: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7-6.5-7-11.5A7 7 0 0 1 19 9.5C19 14.5 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.3"/></svg>`). Static HTML has no access to the JS helper at parse time — only `js/app.js`-generated markup can call `renderIcon()` directly in a template string.
- `h.badges[0]`/`h.badges[1]` text content is still set by the existing `renderHero()` logic (`document.getElementById('hero-badge-1')`, unchanged) — the static placeholder text above ("Développeur Web"/"Développeur Mobile") is simply the pre-render fallback, exactly like the current file already does.
- The `<span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">` wrapper that used to color the second half of the title is gone from the static markup — but `hero.title` in `portfolio-data.js` still contains that exact class string in its HTML, and `renderHero()` sets `titleEl.innerHTML = h.title` (unchanged). The static fallback markup above is cosmetic only (visible for a frame before JS runs); the CSS rule in Step 3 neutralizes the gradient regardless of whether it's the static fallback or the data-injected version.

- [ ] **Step 2: Remove `.mouse-glow` from `css/utilities.css` and position the canvas**

Replace `css/utilities.css` lines 33-58 (the entire "2. HALO LUMINEUX DE SOURIS" section) with:

```css
/* ==========================================================================
   2. CANVAS D'ÉTOILES DU HERO
   ==========================================================================
   Positionnement uniquement — le dessin est géré par js/app.js (fonction
   initHeroCanvas). Le canvas est purement décoratif (aria-hidden="true"
   dans le HTML) et n'encode aucune information.
*/
#hero-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
}
```

- [ ] **Step 3: Add hero CSS to `css/components.css`**

Append:

```css

/* ==========================================================================
   7. HERO ("Carte Céleste")
   ========================================================================== */
.hero {
    position: relative;
    overflow: hidden;
    border-bottom: 1px solid var(--line);
}
.hero-inner {
    position: relative;
    z-index: 1;
    max-width: 1200px;
    margin: 0 auto;
    padding: 64px 24px 84px;
    display: grid;
    grid-template-columns: 1.1fr .9fr;
    gap: 56px;
    align-items: center;
}
.hero-coord {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 22px;
    font-size: 12px;
    letter-spacing: .03em;
    color: var(--accent-ink);
}
.hero-coord .icon {
    width: 13px;
    height: 13px;
}
.hero-status {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 22px;
    font-size: 12.5px;
    font-weight: 700;
    color: var(--accent-ink);
    background: rgba(232, 162, 60, .09);
    border: 1px solid rgba(232, 162, 60, .26);
    padding: 7px 13px;
    border-radius: 999px;
}
.hero-status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--accent);
    flex: none;
}
.hero-title {
    font-family: 'Space Grotesk', -apple-system, sans-serif;
    font-weight: 700;
    font-size: clamp(2.2rem, 4.4vw, 3.4rem);
    letter-spacing: -.01em;
    line-height: 1.14;
    max-width: 15ch;
    color: var(--ink);
}
.hero-title span {
    color: var(--ink);
    background: none;
    -webkit-text-fill-color: currentColor;
}
.hero-desc {
    margin-top: 20px;
    max-width: 48ch;
    font-size: 1.05rem;
    color: var(--ink-70);
    line-height: 1.65;
}
.hero-cta-row {
    display: flex;
    gap: 12px;
    margin-top: 30px;
    flex-wrap: wrap;
}
.btn {
    font-size: 13.5px;
    padding: 13px 22px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 1.5px solid var(--ink);
    text-decoration: none;
    cursor: pointer;
    transition: background .2s, color .2s, transform .2s;
}
.btn-primary {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--bg);
}
.btn-primary:hover {
    background: var(--accent-ink);
    border-color: var(--accent-ink);
    transform: translateY(-2px);
}
.btn-ghost {
    background: none;
    color: var(--ink);
}
.btn-ghost:hover {
    background: var(--ink);
    color: var(--bg);
}
.hero-visual {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
}
.postcard {
    position: relative;
    border: 1px solid var(--line);
    border-radius: var(--radius);
    padding: 14px;
    background: var(--bg-2);
    width: 100%;
    max-width: 340px;
}
.postcard-viewport {
    position: relative;
    overflow: hidden;
    aspect-ratio: 3/4;
    border-radius: 6px;
}
.postcard-viewport img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.postcard-tag {
    position: absolute;
    right: 26px;
    bottom: 26px;
    background: var(--bg);
    border: 1px solid var(--line);
    border-radius: 6px;
    padding: 7px 11px;
    font-size: 10.5px;
    color: var(--accent-ink);
}
.hero-badges {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
}
.hero-badge {
    border: 1px solid var(--line);
    border-radius: 999px;
    padding: 8px 16px;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--ink-70);
    background: var(--bg-2);
}
@media (max-width: 900px) {
    .hero-inner { grid-template-columns: 1fr; }
}
.mono {
    font-family: ui-monospace, "SF Mono", Consolas, monospace;
}
```

- [ ] **Step 4: Add the star-canvas function and remove the mouse-glow listener block in `js/app.js`**

Replace lines 103-134 (the entire "5. HALO LUMINEUX DE SOURIS" block, from the comment through the closing `}` of the `if (heroSection && mouseGlow...)` block) with:

```js
    /* ==========================================================================
       5. CHAMP D'ÉTOILES INTERACTIF DU HERO
       ========================================================================== 
       Dessine un champ de points animés dans le canvas #hero-canvas ; les
       points proches sont reliés par des filets, et se relient au curseur
       en survol. Remplace le halo de souris + les bulles de parallaxe.
    */
    function initHeroCanvas() {
        const canvas = document.getElementById('hero-canvas');
        const heroEl = document.getElementById('hero');
        if (!canvas || !heroEl) return;

        const ctx = canvas.getContext('2d');
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        let stars = [];
        const mouse = { x: null, y: null };

        function resize() {
            const rect = heroEl.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
            initStars();
        }

        function initStars() {
            const area = canvas.width * canvas.height;
            const count = Math.min(90, Math.max(30, Math.floor(area / 26000)));
            stars = [];
            for (let i = 0; i < count; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.28 * dpr,
                    vy: (Math.random() - 0.5) * 0.28 * dpr,
                    r: (Math.random() * 1.1 + 0.6) * dpr
                });
            }
        }

        heroEl.addEventListener('pointermove', (e) => {
            const rect = heroEl.getBoundingClientRect();
            mouse.x = (e.clientX - rect.left) * dpr;
            mouse.y = (e.clientY - rect.top) * dpr;
        });
        heroEl.addEventListener('pointerleave', () => { mouse.x = null; mouse.y = null; });

        const linkDist = 120 * dpr;
        const mouseDist = 170 * dpr;

        function drawFrame() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            stars.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
            });

            for (let i = 0; i < stars.length; i++) {
                for (let j = i + 1; j < stars.length; j++) {
                    const a = stars[i], b = stars[j];
                    const dx = a.x - b.x, dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < linkDist) {
                        ctx.strokeStyle = `rgba(232,162,60,${0.16 * (1 - dist / linkDist)})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
                if (mouse.x !== null) {
                    const mdx = stars[i].x - mouse.x, mdy = stars[i].y - mouse.y;
                    const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
                    if (mdist < mouseDist) {
                        ctx.strokeStyle = `rgba(240,182,94,${0.55 * (1 - mdist / mouseDist)})`;
                        ctx.lineWidth = 1.2;
                        ctx.beginPath();
                        ctx.moveTo(stars[i].x, stars[i].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                    }
                }
            }

            stars.forEach(p => {
                ctx.fillStyle = 'rgba(243,241,232,.75)';
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        resize();
        window.addEventListener('resize', resize);

        if (prefersReducedMotion) {
            drawFrame();
        } else {
            (function loop() { drawFrame(); requestAnimationFrame(loop); })();
        }
    }
    initHeroCanvas();
```

- [ ] **Step 5: Remove the now-dead parallax listener**

Replace lines 630-652 (the entire "9. EFFET DE PARALLAXE DOUX" block) — delete it entirely (no replacement; `.parallax-bg`/`.parallax-bg-bottom` elements no longer exist in the DOM after Step 1's markup rewrite, and Task 1's spec note already confirmed this listener is safe to leave OR remove; removing it is cleaner since the elements it targets are permanently gone, not just temporarily empty).

- [ ] **Step 6: Visual check**

Serve and open the site. Confirm:
- A field of small dots drifts slowly across the hero background, with faint connecting lines between nearby dots.
- Moving the mouse over the hero draws brighter gold lines from nearby dots to the cursor.
- The portrait renders inside the postcard frame with the "Point de départ" tag visible in its corner.
- The coordinate line and availability badge appear above the headline.
- No console errors (in particular, no `mouseGlow is not defined` or similar — confirms Step 5's removal didn't leave a dangling reference elsewhere; grep `mouse-glow\|mouseGlow\|parallax` across `js/app.js` and `index.html` to double check zero remaining references before moving on).

- [ ] **Step 7: Commit**

```bash
git add index.html css/components.css css/utilities.css js/app.js
git commit -m "feat: hero star canvas, coordinate line, postcard portrait frame"
```

No `tailwind-build.css` rebuild needed.

---

### Task 4: About → "Le chemin parcouru"

**Files:**
- Modify: `index.html:369-475` (entire `<section id="about">`)
- Modify: `css/components.css` (rubriques + timeline-entry + value-card rules, appended; existing `.tab-btn`/`.tab-content` rules at lines 15-42 are replaced, not appended twice)
- Modify: `js/app.js:251-292` (`renderAbout()` body templates)

**Interfaces:**
- Consumes: nothing new from other tasks.
- Produces: `.tl-item`/`.tl-date`/`.tl-title`/`.tl-desc` (timeline-entry component), reused as-is by no other task (Projects, Task 6, uses its own `.stop-card`, not this).

- [ ] **Step 1: Rewrite the About section markup**

Replace `index.html` lines 369-475 with:

```html
      <section class="section" id="about">
        <div class="section-inner">
          <span class="eyebrow">À propos</span>
          <h2 class="section-title">Le chemin parcouru</h2>
          <p class="section-sub">Du baccalauréat scientifique à la licence en Génie Logiciel, les grandes étapes de ma formation.</p>

          <h3 class="about-story-title" id="about-story-title">Créer avec Code &amp; Innovation.</h3>
          <div id="about-paragraphs" class="about-paragraphs">
            <!-- Rempli dynamiquement par renderAbout() -->
          </div>

          <div class="rubriques">
            <button class="rubrique-btn active" data-tab="journey">Mon Histoire</button>
            <button class="rubrique-btn" data-tab="edu">Études</button>
            <button class="rubrique-btn" data-tab="core">Valeurs</button>
          </div>

          <div class="tab-content active" id="tab-journey">
            <p class="flowing-text" id="about-journey-1"></p>
            <p class="flowing-text" id="about-journey-2"></p>
          </div>

          <div class="tab-content" id="tab-edu">
            <div class="timeline" id="about-education-container">
              <!-- Rempli dynamiquement -->
            </div>
          </div>

          <div class="tab-content" id="tab-core">
            <div class="value-grid" id="about-values-container">
              <!-- Rempli dynamiquement -->
            </div>
          </div>
        </div>
      </section>
```

- [ ] **Step 2: Rewrite `renderAbout()` in `js/app.js`**

Replace lines 251-292 with:

```js
    const renderAbout = () => {
        const a = PORTFOLIO_DATA.about;
        if (!a) return;

        const titleEl = document.getElementById('about-story-title');
        if (titleEl) titleEl.textContent = a.title || '';

        const paragraphsEl = document.getElementById('about-paragraphs');
        if (paragraphsEl && a.paragraphs) {
            paragraphsEl.innerHTML = a.paragraphs.map(p =>
                `<p class="flowing-text">${p}</p>`
            ).join('');
        }

        const journey1 = document.getElementById('about-journey-1');
        if (journey1 && a.journey) journey1.textContent = a.journey.text1 || '';

        const journey2 = document.getElementById('about-journey-2');
        if (journey2 && a.journey) journey2.textContent = a.journey.text2 || '';

        const eduContainer = document.getElementById('about-education-container');
        if (eduContainer && a.education) {
            eduContainer.innerHTML = a.education.map(e => `
                <div class="tl-item">
                  <span class="tl-date mono">${e.dates}</span>
                  <div>
                    <div class="tl-title">${e.degree}</div>
                    <p class="tl-desc">${e.school}. ${e.desc}</p>
                  </div>
                </div>
            `).join('');
        }

        const valuesContainer = document.getElementById('about-values-container');
        if (valuesContainer && a.values) {
            valuesContainer.innerHTML = a.values.map(v => `
                <div class="value-card">
                  <span class="value-emoji muted-emoji">${v.emoji || '★'}</span>
                  <div class="value-title">${v.title}</div>
                  <p class="value-desc">${v.desc}</p>
                </div>
            `).join('');
        }
    };
```

- [ ] **Step 3: Replace the tab styling and add the new component rules in `css/components.css`**

Replace lines 15-42 (the entire "1. BOUTONS D'ONGLETS" section, `.tab-btn`/`.tab-content` rules) with:

```css
/* ==========================================================================
   1. RUBRIQUES (onglets À propos) + SECTIONS GÉNÉRIQUES DE LA COLONNE
   ========================================================================== */
.section {
    border-top: 1px solid var(--line);
}
.section-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 80px 24px;
}
.eyebrow {
    font-size: 12.5px;
    font-weight: 700;
    letter-spacing: .05em;
    text-transform: uppercase;
    color: var(--accent-ink);
    margin-bottom: 12px;
    display: block;
}
.section-title {
    font-family: 'Space Grotesk', -apple-system, sans-serif;
    font-weight: 700;
    font-size: clamp(1.8rem, 3.2vw, 2.4rem);
    letter-spacing: -.01em;
    color: var(--ink);
}
.section-sub {
    margin: 12px 0 36px;
    max-width: 58ch;
    color: var(--ink-70);
    font-size: 1.02rem;
}
.about-story-title {
    font-family: 'Space Grotesk', -apple-system, sans-serif;
    font-weight: 700;
    font-size: 1.3rem;
    color: var(--ink);
    margin-bottom: 16px;
}
.about-paragraphs {
    margin-bottom: 32px;
}
.flowing-text {
    color: var(--ink-70);
    font-size: 1rem;
    line-height: 1.7;
    margin-bottom: 14px;
}
.rubriques {
    display: flex;
    gap: 24px;
    border-bottom: 1px solid var(--line);
    margin-bottom: 32px;
}
.rubrique-btn {
    background: none;
    border: none;
    padding: 0 0 12px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: .03em;
    color: var(--ink-45);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: color .2s, border-color .2s;
    margin-bottom: -1px;
}
.rubrique-btn.active {
    color: var(--accent-ink);
    border-color: var(--accent);
}
.rubrique-btn:hover {
    color: var(--ink);
}
.tab-content {
    display: none;
    animation: fadeIn 0.4s ease-out forwards;
}
.tab-content.active {
    display: block;
}
```

Then append the timeline/value-card rules:

```css

/* ==========================================================================
   5. FRISE (formations) + CARTES DE VALEURS
   ========================================================================== */
.timeline {
    display: flex;
    flex-direction: column;
}
.tl-item {
    display: grid;
    grid-template-columns: 112px 1fr;
    gap: 24px;
    padding: 22px 0;
    border-bottom: 1px solid var(--line);
}
.tl-item:first-child { padding-top: 0; }
.tl-item:last-child { border-bottom: none; }
.tl-date {
    font-size: 12.5px;
    font-weight: 600;
    color: var(--accent-ink);
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 6px;
    padding: 5px 9px;
    align-self: start;
    text-align: center;
}
.tl-title {
    font-weight: 700;
    font-size: 1.02rem;
    color: var(--ink);
    margin-bottom: 6px;
}
.tl-desc {
    color: var(--ink-70);
    font-size: 14.5px;
    line-height: 1.6;
    max-width: 60ch;
}
@media (max-width: 640px) {
    .tl-item { grid-template-columns: 1fr; gap: 8px; }
}

.value-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
}
.value-card {
    border: 1px solid var(--line);
    border-radius: var(--radius);
    background: var(--bg-2);
    padding: 20px;
}
.value-emoji {
    font-size: 22px;
    display: block;
    margin-bottom: 10px;
}
.muted-emoji {
    filter: grayscale(1) opacity(.85);
}
.value-title {
    font-weight: 700;
    color: var(--ink);
    margin-bottom: 6px;
}
.value-desc {
    color: var(--ink-70);
    font-size: 13.5px;
    line-height: 1.55;
}
@media (max-width: 640px) {
    .value-grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 4: Update the tab-click JS to use the new class names**

Replace `js/app.js` lines 679-695 (the "11. ONGLETS DE PRÉSENTATION INTERACTIFS" block):

```js
    const tabButtons = document.querySelectorAll('.rubrique-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            const targetContent = document.getElementById(`tab-${tabName}`);
            if (targetContent) targetContent.classList.add('active');
        });
    });
```

(The `data-tab` attribute and `#tab-{name}` id contract is unchanged — only the button class renamed from `.tab-btn` to `.rubrique-btn`, matching Step 1's markup and Step 3's CSS.)

- [ ] **Step 5: Visual check**

Serve and open the site, scroll to "Le chemin parcouru". Confirm:
- Intro title + 2 paragraphs render above the rubriques.
- "Mon Histoire" is active by default, showing the two journey paragraphs as flowing text (no date badges).
- Clicking "Études" shows a dated timeline (each entry: date badge, degree, school + description).
- Clicking "Valeurs" shows a 2×2 grid of value cards, each with a desaturated emoji, title, and description.
- No console errors.

- [ ] **Step 6: Commit**

```bash
git add index.html css/components.css js/app.js
git commit -m "feat: restyle About as 'Le chemin parcouru' (rubriques, timeline, value cards)"
```

No `tailwind-build.css` rebuild needed.

---

### Task 5: Skills → "Compétences techniques"

**Files:**
- Modify: `index.html:489-511` (entire `<section id="skills">`)
- Modify: `css/components.css` (skill-legend rules, appended)
- Modify: `js/app.js:294-326` (`renderSkills()`), and `triggerSkillsAnimation()` (search for it, do not assume its original line numbers — Step 2b)

**Interfaces:**
- Consumes: `renderIcon()` (Task 1) for category icons (`palette`/`database`/`smartphone`/`star` fallback).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Rewrite the Skills section markup**

Replace `index.html` lines 489-511 with:

```html
      <section class="section" id="skills">
        <div class="section-inner">
          <span class="eyebrow">Compétences</span>
          <h2 class="section-title">Compétences techniques</h2>
          <p class="section-sub">Trois domaines travaillés en parallèle, avec le niveau de maîtrise réel pour chaque technologie.</p>

          <div class="skill-legend" id="skills-categories-container">
            <!-- Rempli dynamiquement -->
          </div>
        </div>
      </section>
```

- [ ] **Step 2: Rewrite `renderSkills()` in `js/app.js`**

Replace lines 294-326 with:

```js
    const renderSkills = () => {
        const container = document.getElementById('skills-categories-container');
        if (!container || !PORTFOLIO_DATA.skills) return;

        const iconFor = (name) => (ICONS[name] ? name : 'star');

        container.innerHTML = PORTFOLIO_DATA.skills.map(cat => {
            const skillItemsHtml = cat.items.map(item => `
                <div class="skill-row">
                  <div class="skill-row-top">
                    <span>${item.name}</span>
                    <span class="skill-percent">${item.percent}%</span>
                  </div>
                  <div class="skill-fill-track">
                    <div class="skill-bar-fill" data-percent="${item.percent}"></div>
                  </div>
                </div>
            `).join('');

            return `
                <div class="skill-legend-col">
                  <h3>${renderIcon(iconFor(cat.icon))} ${cat.category}</h3>
                  ${skillItemsHtml}
                </div>
            `;
        }).join('');

        triggerSkillsAnimation();
    };
```

(`iconFor()` guards against a category `icon` value that isn't one of the 4 mapped icons — `PORTFOLIO_DATA.skills[].icon` today is always `"palette"`, `"database"`, or `"smartphone"`, all present in `ICONS`, but this keeps the renderer safe if the dashboard is ever used to set a different string. The inline `style="width: 0%;"` the current codebase sets on this element is dropped — the fill now starts collapsed via a CSS default `transform: scaleX(0)`, see Step 3, and Step 2b below drives it by `transform` instead of `width` for performance.)

- [ ] **Step 2b: Switch `triggerSkillsAnimation()` from animating `width` to animating `transform`**

Animating `width` causes a layout recalculation on every frame; `transform: scaleX()` is compositor-only and does not. The visible result and the `data-percent` contract are identical — only the CSS property driving the fill changes. Replace the function (originally at lines 703-728, search for `function triggerSkillsAnimation()` since Tasks 1-4 may have shifted the exact line numbers):

```js
    function triggerSkillsAnimation() {
        const skillBars = document.querySelectorAll('.skill-bar-fill');
        const skillsSection = document.getElementById('skills');
        const fillBar = (bar) => {
            const targetPercent = parseFloat(bar.getAttribute('data-percent')) || 0;
            bar.style.transform = `scaleX(${targetPercent / 100})`;
        };
        if (skillsSection && skillBars.length > 0 && !prefersReducedMotion) {
            const skillsObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        document.querySelectorAll('.skill-bar-fill').forEach(fillBar);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15 });

            skillsObserver.observe(skillsSection);
        } else {
            skillBars.forEach(fillBar);
        }
    }
```

- [ ] **Step 3: Add skill-legend CSS to `css/components.css`**

Append:

```css

/* ==========================================================================
   2. TABLEAU DE COMPÉTENCES (Compétences techniques)
   ========================================================================== */
.skill-legend {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1px;
    background: var(--line);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    overflow: hidden;
}
.skill-legend-col {
    background: var(--bg-2);
    padding: 24px 22px;
}
.skill-legend-col h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: .04em;
    text-transform: uppercase;
    color: var(--accent-ink);
    margin-bottom: 18px;
}
.skill-legend-col h3 .icon {
    width: 15px;
    height: 15px;
}
.skill-row {
    padding: 9px 0;
    border-bottom: 1px solid var(--line);
}
.skill-row:last-child {
    border-bottom: none;
}
.skill-row-top {
    display: flex;
    justify-content: space-between;
    font-size: 13.5px;
    color: var(--ink);
    margin-bottom: 6px;
}
.skill-percent {
    font-weight: 700;
    color: var(--accent-ink);
    font-variant-numeric: tabular-nums;
}
.skill-fill-track {
    width: 100%;
    height: 2px;
    background: var(--line);
    overflow: hidden;
}
.skill-bar-fill {
    height: 100%;
    width: 100%;
    background: var(--accent);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 1.5s cubic-bezier(0.1, 1, 0.1, 1);
}
@media (max-width: 900px) {
    .skill-legend { grid-template-columns: 1fr; }
}
```

(`.skill-bar-fill`'s `id`/behavior contract — `data-percent` read by `triggerSkillsAnimation()` — is untouched; its visual rendering shrinks from a rounded gradient bar to a 2px flat fill, per spec §5.4, and per Step 2b now fills via `transform: scaleX()` instead of `width` — same visible result, no layout-property animation.)

- [ ] **Step 4: Visual check**

Serve and open the site, scroll to "Compétences techniques". Confirm:
- Three columns (Frontend & UI / Backend & APIs / Mobile & autres), each with an icon + category name heading.
- Each skill row shows name + percent, with a thin line beneath.
- Scrolling the section into view animates each thin line filling to its `data-percent` width (open DevTools, confirm `.skill-bar-fill` elements' inline `transform` style updates from `scaleX(0)` to `scaleX(<percent/100>)` once the section scrolls into view).
- No console errors.

- [ ] **Step 5: Commit**

```bash
git add index.html css/components.css js/app.js
git commit -m "feat: restyle Skills as numeric legend table with icon category headers"
```

No `tailwind-build.css` rebuild needed.

---

### Task 6: Projects → "Étapes du parcours"

**Files:**
- Modify: `index.html:530-576` (entire `<section id="projects">`)
- Modify: `css/components.css` (`.stop-card` rules, appended; `.project-card` hover rule at lines 66-73 removed, replaced)
- Modify: `js/app.js:328-400` (`renderProjects()`), `js/app.js:736-774` (filter logic — softened scroll-entry easing, simplified active-state classes)

**Interfaces:**
- Consumes: `renderIcon()` (Task 1) for external-link icons.
- Produces: `.stop-card`/`.stop-viewport`/`.stop-body` component, consumed by Task 7 (modal) only conceptually (matching visual language, not shared markup).

- [ ] **Step 1: Rewrite the Projects section markup**

Replace `index.html` lines 530-576 with:

```html
      <section class="section" id="projects">
        <div class="section-inner">
          <span class="eyebrow">Réalisations</span>
          <h2 class="section-title">Étapes du parcours</h2>
          <p class="section-sub">Une sélection de mes travaux académiques et personnels, du développement web aux applications mobiles.</p>

          <div class="filter-row">
            <button class="filter-btn active" data-filter="all">Tout</button>
            <button class="filter-btn" data-filter="web">Web Advanced</button>
            <button class="filter-btn" data-filter="mobile">Applications Mobiles</button>
          </div>

          <div class="stops" id="projects-grid">
            <!-- Les cartes de projets seront injectées dynamiquement par JS -->
          </div>
        </div>
      </section>
```

- [ ] **Step 2: Rewrite `renderProjects()` in `js/app.js`**

Replace lines 328-400 with:

```js
    const renderProjects = () => {
        const grid = document.getElementById('projects-grid');
        if (!grid || !PORTFOLIO_DATA.projects) return;

        grid.innerHTML = PORTFOLIO_DATA.projects.map(proj => `
          <article class="stop-card" data-category="${proj.category}" data-project-id="${proj.id}">
            <div class="stop-viewport">
              <img alt="${proj.cardTitle}" src="${proj.image}" />
            </div>
            <div class="stop-body">
              <span class="stop-cat">${proj.categoryLabel}</span>
              <h3 class="project-title">${proj.cardTitle}</h3>
              <p>${proj.shortDescription}</p>
              <div class="tech-row">
                ${proj.tech.slice(0, 3).map(t => `<span class="tech-pill">${t}</span>`).join('')}
              </div>
              <div class="stop-links">
                ${proj.demo !== '#' ? `<a href="${proj.demo}" target="_blank" rel="noopener" class="external-link">${renderIcon('link')} Démo</a>` : ''}
                ${proj.source !== '#' ? `<a href="${proj.source}" target="_blank" rel="noopener" class="external-link">${renderIcon('code')} Code</a>` : ''}
              </div>
            </div>
          </article>
        `).join('');

        document.querySelectorAll('#projects-grid .stop-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.external-link')) return;
                const projectId = card.getAttribute('data-project-id');
                if (projectId) openProjectModal(projectId);
            });
        });

        const revealCards = document.querySelectorAll('#projects-grid .stop-card');
        if ('IntersectionObserver' in window) {
            const cardObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry, idx) => {
                    if (entry.isIntersecting) {
                        const delay = Array.prototype.indexOf.call(revealCards, entry.target) * 70;
                        setTimeout(() => entry.target.classList.add('in'), delay);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15 });
            revealCards.forEach(card => cardObserver.observe(card));
        } else {
            revealCards.forEach(card => card.classList.add('in'));
        }
    };
```

Note: `data-category` (not `data-category="${proj.category}"` typo-duplicated) matches the identifier contract exactly (`.project-card`/`data-category`/`data-project-id` in spec §7 — the class is renamed `stop-card` but the two data attributes keep their exact names, which is all the contract requires: the spec's identifier list names the *attributes*, not the CSS class, as the stable contract). `proj.categoryLabel` (e.g. "Web app full-stack") replaces the old raw `proj.category` (e.g. "web") in the visible eyebrow text — this is the exact fix called out in spec §2/§5.5 (no more category/title duplication, and now showing the human-readable label instead of the filter's internal value).

- [ ] **Step 3: Replace `.project-card` CSS with `.stop-card` in `css/components.css`**

Replace lines 66-73 (the entire "3. CARTES DE PROJETS" section) with:

```css
/* ==========================================================================
   3. CARTES "ÉTAPE" (Projets)
   ========================================================================== */
.filter-row {
    display: flex;
    gap: 10px;
    margin-bottom: 36px;
    flex-wrap: wrap;
}
.filter-btn {
    font-size: 12.5px;
    font-weight: 700;
    padding: 9px 16px;
    border-radius: 999px;
    border: 1.5px solid var(--ink);
    color: var(--ink-70);
    background: none;
    cursor: pointer;
    transition: background .2s, color .2s;
}
.filter-btn.active,
.filter-btn:hover {
    background: var(--ink);
    color: var(--bg);
}
.stops {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 28px;
}
.stop-card {
    border: 1px solid var(--line);
    border-radius: var(--radius);
    background: var(--bg-2);
    overflow: hidden;
    cursor: pointer;
    opacity: 0;
    transform: translateY(18px);
    transition: opacity .55s cubic-bezier(.16,1,.3,1), transform .55s cubic-bezier(.16,1,.3,1), border-color .3s;
}
.stop-card.in {
    opacity: 1;
    transform: none;
}
.stop-card:hover {
    border-color: var(--accent);
}
.stop-viewport {
    aspect-ratio: 16/10;
    overflow: hidden;
    background: var(--bg-3);
}
.stop-viewport img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform .6s ease;
}
.stop-card:hover .stop-viewport img {
    transform: scale(1.05);
}
.stop-body {
    padding: 22px;
}
.stop-cat {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .05em;
    text-transform: uppercase;
    color: var(--accent-ink);
}
.stop-body h3 {
    font-family: 'Space Grotesk', -apple-system, sans-serif;
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--ink);
    margin: 8px 0;
}
.stop-body p {
    font-size: 13.8px;
    color: var(--ink-70);
    line-height: 1.55;
}
.tech-row {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin-top: 15px;
}
.tech-pill {
    font-size: 10.8px;
    font-weight: 600;
    border: 1px solid var(--line);
    border-radius: 999px;
    padding: 4px 10px;
    color: var(--ink-70);
}
.stop-links {
    display: flex;
    gap: 16px;
    margin-top: 16px;
}
.stop-links a {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-weight: 700;
    font-size: 12.5px;
    text-decoration: none;
    color: var(--accent-ink);
    border-bottom: 1.5px solid var(--accent);
    padding-bottom: 2px;
}
.stop-links a:hover {
    color: var(--ink);
    border-color: var(--ink);
}
.stop-links .icon {
    width: 13px;
    height: 13px;
}
@media (max-width: 820px) {
    .stops { grid-template-columns: 1fr; }
}
```

(`@keyframes fadeIn` referenced by `.tab-content` in Task 4 must still exist somewhere in `css/animations.css` — it already does, untouched by this plan; verify with a quick grep if in doubt.)

- [ ] **Step 4: Simplify the filter-click handler in `js/app.js`**

Replace lines 736-774 (the entire "13. FILTRAGE" block):

```js
    /* ==========================================================================
       13. FILTRAGE DES CARTES "ÉTAPE"
       ========================================================================== 
       Filtre dynamiquement les projets affichés à l'écran ; les cartes non
       concernées sont simplement masquées (display:none), pas de mise en scène
       d'échelle/translation ici — .stop-card garde son entrée .in existante.
    */
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filterValue = button.getAttribute('data-filter');

            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            document.querySelectorAll('#projects-grid .stop-card').forEach(card => {
                const category = card.getAttribute('data-category');
                card.style.display = (filterValue === 'all' || category === filterValue) ? '' : 'none';
            });
        });
    });
```

(This replaces the old NodeList-captured-once `projectCardsGrid` variable — Task 2's summary and the pre-existing-bugs memory both note this was one of the two known live-preview bugs; querying fresh inside the click handler, as done here, incidentally fixes it for this branch. This is a natural byproduct of rewriting the function, not a separate scoped fix — no extra step needed, just note it in the final verification task, Task 10.)

- [ ] **Step 5: Visual check**

Serve and open the site, scroll to "Étapes du parcours". Confirm:
- 4 project cards render in a 2-column grid, each fading/sliding in with a slight stagger as you scroll to them (no pronounced bounce).
- Each card's small eyebrow above the title shows the category label (e.g. "Web app full-stack"), not a repeat of the title.
- Clicking "Web Advanced"/"Applications Mobiles" filters correctly; clicking "Tout" restores all cards.
- Clicking a card (not on a Démo/Code link) opens the (still old-styled, until Task 7) project modal without errors.
- No console errors.

- [ ] **Step 6: Commit**

```bash
git add index.html css/components.css js/app.js
git commit -m "feat: restyle Projects as 'Etapes du parcours' stop cards, fix category label"
```

No `tailwind-build.css` rebuild needed.

---

### Task 7: Project detail modal → "fiche d'étape"

**Files:**
- Modify: `js/app.js:142-217` (`openProjectModal()`/`closeProjectModal()` and their listeners — template rewritten, logic unchanged)
- Modify: `index.html:954-970` (`#project-modal` static shell — close-button icon)
- Modify: `css/overlays.css` (`.modal-overlay`/`.modal-container` recolor + new `.article-*` rules, appended)

**Interfaces:**
- Consumes: `renderIcon()` (Task 1).
- Produces: nothing consumed elsewhere.

- [ ] **Step 1: Update the static modal shell's close button**

Replace `index.html` lines 954-970 (`<div class="modal-overlay" id="project-modal">`) with:

```html
    <div class="modal-overlay" id="project-modal" aria-hidden="true">
      <div class="modal-container p-6 relative">
        <button class="modal-close" id="close-project-modal" aria-label="Fermer la modale">
          ${'' /* remplacé ci-dessous par l'icône réelle, voir note */}
        </button>
        <div id="project-modal-content">
          <!-- Populé dynamiquement par JavaScript -->
        </div>
      </div>
    </div>
```

As in Task 3 Step 1, static HTML cannot call `renderIcon()`. Replace the placeholder comment with the literal `close` icon markup (copy the `close` entry from `js/icons.js`, wrapped as `renderIcon('close')` would produce it):

```html
        <button class="modal-close" id="close-project-modal" aria-label="Fermer la modale"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg></button>
```

- [ ] **Step 2: Rewrite `openProjectModal()` in `js/app.js`**

Replace lines 147-200 (the body of `openProjectModal`, keeping the `const openProjectModal = (projectId) => { ... };` wrapper) with:

```js
    const openProjectModal = (projectId) => {
        const data = PROJECTS_DATA[projectId];
        if (!data || !projectModal || !projectModalContent) return;

        const techBadges = data.tech.map(t => `<span class="tech-pill">${t}</span>`).join('');

        const featuresList = data.features.map(f => `
            <li>${renderIcon('check')}<span>${f}</span></li>
        `).join('');

        const links = `
            ${data.demo !== '#' ? `<a href="${data.demo}" target="_blank" rel="noopener" class="btn btn-primary">${renderIcon('link')} Voir la démo</a>` : ''}
            ${data.source !== '#' ? `<a href="${data.source}" target="_blank" rel="noopener" class="btn btn-ghost">${renderIcon('code')} Code source</a>` : ''}
        `;

        projectModalContent.innerHTML = `
            <article class="article-sheet">
                <div class="article-image">
                    <img src="${data.image}" alt="${data.title}">
                </div>
                <span class="stop-cat">${data.categoryLabel}</span>
                <h2 class="article-title">${data.title}</h2>
                <div class="tech-row">${techBadges}</div>
                <p class="article-desc">${data.description}</p>
                <div class="article-brief">
                    <h4>En bref</h4>
                    <ul>${featuresList}</ul>
                </div>
                ${(data.demo !== '#' || data.source !== '#') ? `<div class="article-links">${links}</div>` : ''}
            </article>
        `;

        projectModal.classList.add('active');
        projectModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };
```

Use `data.categoryLabel` (the human-readable string, e.g. `"Web app full-stack"`), not `data.category` (the short filter value, e.g. `"web"`) — same object as `PROJECTS_DATA[projectId]` reconstructed from `PORTFOLIO_DATA.projects`, matching the field Task 6 already uses for the card eyebrow.

- [ ] **Step 3: Verify `closeProjectModal()` and listeners need no changes**

Lines 202-217 (`closeProjectModal`, the `closeProjectBtn`/`projectModal` click listeners) reference only `#project-modal`, `#close-project-modal`, `#project-modal-content` — all unchanged ids. No edit needed here; confirm by reading the current lines after Step 2's edit shifts line numbers, and leave them as-is.

- [ ] **Step 4: Recolor the modal shell and add article styles to `css/overlays.css`**

Replace lines 49-93 (`.modal-overlay` through the end of `.modal-container`'s dark-mode rule) with:

```css
/* ==========================================================================
   2. SYSTÈME DE FENÊTRES MODALES (DÉTAILS PROJETS & CV)
   ========================================================================== */
.modal-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(15, 27, 46, .7);
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
    position: relative;
    background-color: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    width: 100%;
    max-width: 700px;
    max-height: 90vh;
    overflow-y: auto;
    transform: scale(0.96) translateY(16px);
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-overlay.active .modal-container {
    transform: scale(1) translateY(0);
}

.modal-close {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
    border: 1px solid var(--line);
    border-radius: 10px;
    background: var(--bg);
    color: var(--ink);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
}
.modal-close:hover {
    color: var(--accent-ink);
    border-color: var(--accent);
}
```

Then append the article-sheet rules:

```css

/* ==========================================================================
   4. FICHE D'ÉTAPE (modale de détail projet)
   ========================================================================== */
.article-sheet {
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.article-image {
    aspect-ratio: 16/9;
    border-radius: 10px;
    overflow: hidden;
    background: var(--bg-3);
    margin-bottom: 12px;
}
.article-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.article-title {
    font-family: 'Space Grotesk', -apple-system, sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--ink);
    margin: 6px 0 10px;
}
.article-desc {
    color: var(--ink-70);
    font-size: 14.5px;
    line-height: 1.65;
    margin: 16px 0;
}
.article-brief {
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 18px 20px;
    margin-bottom: 20px;
}
.article-brief h4 {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .05em;
    text-transform: uppercase;
    color: var(--accent-ink);
    margin-bottom: 12px;
}
.article-brief ul {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;
}
.article-brief li {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 13.5px;
    color: var(--ink-70);
}
.article-brief li .icon {
    color: var(--accent);
    flex: none;
    margin-top: 2px;
}
.article-links {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}
```

- [ ] **Step 5: Visual check**

Serve and open the site, click any project card. Confirm:
- Modal opens with a dark panel, image, correct category label (not the raw filter value), title, tech pills, description, "En bref" boxed feature list with check icons, and Démo/Code buttons (only for projects with real URLs — confirm the two projects with `demo:"#"`/`source:"#"` don't show a dead-end button for that field).
- Close button (✕ icon) and clicking outside the panel both close it.
- No console errors.

- [ ] **Step 6: Commit**

```bash
git add index.html css/overlays.css js/app.js
git commit -m "feat: restyle project detail modal as 'fiche d'etape' article layout"
```

No `tailwind-build.css` rebuild needed.

---

### Task 8: Contact → "Prochaine destination" + Footer

**Files:**
- Modify: `index.html:702-883` (entire `<section id="contact">`), `index.html:892-942` (`<footer>`)
- Modify: `css/components.css` (form-field rules, replacing lines 76-97; contact-specific rules appended)
- Modify: `js/app.js:402-428` (`renderContact()`), `js/app.js:809-869` (contact form icons only — `send`/`sync` glyphs)

**Interfaces:**
- Consumes: `renderIcon()` (Task 1).
- Produces: nothing consumed elsewhere.

- [ ] **Step 1: Rewrite the Contact section markup**

Replace `index.html` lines 702-883 with:

```html
      <section class="section" id="contact">
        <div class="section-inner">
          <span class="eyebrow">Contact</span>
          <h2 class="section-title">Prochaine destination</h2>
          <p class="section-sub">Un projet, un stage, une question ? Je réponds à tous les messages.</p>

          <div class="dest-grid">
            <div>
              <div class="compass"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="10"/><path d="M15.5 8.5 13 13l-4.5 2.5L11 11l4.5-2.5Z"/></svg></div>
              <div class="field-list">
                <div class="field-row">
                  <span class="field-key mono">Email</span>
                  <span class="field-val"><a href="mailto:jdibangoup5@gmail.com" id="contact-email-link">jdibangoup5@gmail.com</a></span>
                </div>
                <div class="field-row">
                  <span class="field-key mono">Lieu</span>
                  <span class="field-val" id="contact-location-text">Abidjan, Côte d'Ivoire</span>
                </div>
                <div class="field-row">
                  <span class="field-key mono">GitHub</span>
                  <span class="field-val"><a href="#" id="contact-github-link" aria-label="GitHub">Profil GitHub</a></span>
                </div>
                <div class="field-row">
                  <span class="field-key mono">LinkedIn</span>
                  <span class="field-val"><a href="#" id="contact-linkedin-link" aria-label="LinkedIn">Profil LinkedIn</a></span>
                </div>
              </div>
            </div>

            <form class="contact-form" id="contact-form" action="https://api.web3forms.com/submit" method="POST">
              <input type="hidden" name="access_key" value="1e96af0c-37e9-4900-95ab-3413ff598fd2">
              <div class="form-row-2">
                <div>
                  <label for="form-name">Nom complet *</label>
                  <input class="form-input" type="text" id="form-name" name="name" placeholder="Votre nom" required />
                </div>
                <div>
                  <label for="form-email">Adresse e-mail *</label>
                  <input class="form-input" type="email" id="form-email" name="email" placeholder="votre.email@exemple.com" required />
                </div>
              </div>
              <div>
                <label for="form-subject">Sujet *</label>
                <input class="form-input" type="text" id="form-subject" name="subject" placeholder="Sujet de votre message" required />
              </div>
              <div>
                <label for="form-message-text">Votre message *</label>
                <textarea class="form-input" id="form-message-text" name="message" placeholder="Dites-m'en plus sur votre projet..." required></textarea>
              </div>
              <button class="btn btn-primary" type="submit" id="contact-submit-btn">
                <span id="contact-submit-icon"></span> Envoyer le message
              </button>
              <div class="hidden mt-2" id="form-message"></div>
            </form>
          </div>
        </div>
      </section>
```

- [ ] **Step 2: Rewrite the Footer markup**

Replace `index.html` lines 892-942 (the entire `<footer>`) with:

```html
    <footer class="site-footer">
      <div class="footer-inner">
        <div class="footer-brand" id="footer-logo">DevPortfolio</div>
        <ul class="footer-links">
          <li><a href="#about">À Propos</a></li>
          <li><a href="#skills">Compétences</a></li>
          <li><a href="#projects">Projets</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <div class="footer-copy" id="footer-copyright">© 2026 Jordan Portfolio. Conçu avec Précision &amp; Clarté.</div>
      </div>
    </footer>
```

- [ ] **Step 3: Update `renderContact()` in `js/app.js`**

Replace lines 402-428 — the logic is unchanged (same ids, same fields read), only the `mailto:` string gains a fix for a pre-existing stray space that isn't part of this redesign's scope but is trivial to leave as-is; **do not** "fix" it, keep behavior identical:

```js
    const renderContact = () => {
        const c = PORTFOLIO_DATA.contact;
        if (!c) return;

        const emailLink = document.getElementById('contact-email-link');
        if (emailLink) {
            emailLink.href = `mailto: ${c.email}`;
            emailLink.textContent = c.email;
        }

        const locText = document.getElementById('contact-location-text');
        if (locText) locText.textContent = c.location;

        const githubLink = document.getElementById('contact-github-link');
        if (githubLink) githubLink.href = c.github || '#';

        const linkedinLink = document.getElementById('contact-linkedin-link');
        if (linkedinLink) linkedinLink.href = c.linkedin || '#';

        const footerLogo = document.getElementById('footer-logo');
        if (footerLogo) footerLogo.textContent = `${PORTFOLIO_DATA.hero.name}Portfolio`;

        const footerCopyright = document.getElementById('footer-copyright');
        if (footerCopyright) {
            footerCopyright.textContent = `© 2026 ${PORTFOLIO_DATA.hero.name} Portfolio. Conçu avec Précision & Clarté.`;
        }
    };
```

(This function's body is byte-identical to the current one — it's included here only because Step 1 changed the static fallback text inside `#contact-github-link`/`#contact-linkedin-link` from an icon-only link to a text link, and confirming the render function's `href`-only updates still work unchanged is worth the explicit check. No actual code edit is required in this step if the current file already matches; verify with `git diff` after Step 1 that this function's lines are untouched.)

- [ ] **Step 4: Add the send icon and wire the sync spinner in the contact-form submit handler**

In `js/app.js`, locate the "15. FORMULAIRE DE CONTACT" block (originally lines 803-869). Two changes:

1. Right after `contactForm` is resolved (`const contactForm = document.getElementById('contact-form');`), add:

```js
    const contactSubmitIcon = document.getElementById('contact-submit-icon');
    if (contactSubmitIcon) contactSubmitIcon.innerHTML = renderIcon('send');
```

2. Inside the `submit` handler, replace the two lines that set `submitBtn.innerHTML` to a Material-Symbols spinner string:

```js
            submitBtn.disabled = true;
            submitBtn.innerHTML = `${renderIcon('sync', 'icon-spin')} Envoi en cours...`;
```

and in the `.finally()` block, replace `submitBtn.innerHTML = originalBtnText;` — this line is unchanged (it already restores the saved original markup, which now includes the send icon since `originalBtnText` was captured from `submitBtn.innerHTML` before the swap, same as before). No further change needed there.

- [ ] **Step 5: Rewrite form-field and add contact/footer CSS in `css/components.css`**

Replace lines 76-97 (the entire "4. INPUTS DU FORMULAIRE" section) with:

```css
/* ==========================================================================
   4. CHAMPS DU FORMULAIRE DE CONTACT
   ========================================================================== */
.contact-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.form-row-2 {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
}
.contact-form label {
    display: block;
    font-size: 12px;
    letter-spacing: .03em;
    color: var(--ink-45);
    margin-bottom: 8px;
}
.form-input {
    width: 100%;
    border: 1.5px solid var(--line);
    border-radius: 10px;
    background: var(--bg-2);
    color: var(--ink);
    padding: 12px 14px;
    font-family: inherit;
    font-size: 14px;
    transition: border-color .2s;
}
.form-input::placeholder {
    color: var(--ink-45);
}
.form-input:focus {
    outline: none;
    border-color: var(--accent);
}
textarea.form-input {
    resize: vertical;
    min-height: 120px;
}
@media (max-width: 640px) {
    .form-row-2 { grid-template-columns: 1fr; }
}
```

Then append:

```css

/* ==========================================================================
   7. PROCHAINE DESTINATION (Contact) + FOOTER
   ========================================================================== */
.dest-grid {
    display: grid;
    grid-template-columns: .9fr 1.1fr;
    gap: 60px;
}
.compass {
    width: 90px;
    height: 90px;
    border: 1.5px solid var(--accent);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 28px;
    color: var(--accent);
}
.compass svg {
    width: 38px;
    height: 38px;
}
.field-list {
    display: flex;
    flex-direction: column;
}
.field-row {
    padding: 13px 0;
    border-bottom: 1px solid var(--line);
    display: flex;
    justify-content: space-between;
    gap: 16px;
}
.field-row:last-child {
    border-bottom: none;
}
.field-key {
    font-size: 12px;
    letter-spacing: .05em;
    text-transform: uppercase;
    color: var(--ink-45);
}
.field-val {
    color: var(--ink);
    text-align: right;
}
.field-val a {
    color: var(--ink);
    text-decoration: none;
    border-bottom: 1px solid var(--line);
}
.field-val a:hover {
    border-color: var(--accent);
    color: var(--accent-ink);
}
@media (max-width: 820px) {
    .dest-grid { grid-template-columns: 1fr; gap: 44px; }
}

.site-footer {
    border-top: 1px solid var(--line);
}
.footer-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 28px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
}
.footer-brand {
    font-family: 'Space Grotesk', -apple-system, sans-serif;
    font-weight: 700;
    color: var(--ink);
}
.footer-links {
    display: flex;
    gap: 20px;
    list-style: none;
    margin: 0;
    padding: 0;
}
.footer-links a {
    color: var(--ink-70);
    text-decoration: none;
    font-size: 13px;
}
.footer-links a:hover {
    color: var(--accent-ink);
}
.footer-copy {
    font-size: 12.5px;
    color: var(--ink-45);
}
```

- [ ] **Step 6: Visual check**

Serve and open the site, scroll to "Prochaine destination". Confirm:
- Compass icon, 4-row field list (email/lieu/github/linkedin), and a working-looking form (2-column name/email row, subject, message, "Envoyer le message" button with a paper-plane icon) all render correctly.
- Footer shows the brand name, 4 nav links, and copyright text on the dark background.
- Submitting the form with empty fields shows a toast (still old-styled until Task 9) error — do not actually submit a real message during this check (Web3Forms is live).
- No console errors.

- [ ] **Step 7: Commit**

```bash
git add index.html css/components.css js/app.js
git commit -m "feat: restyle Contact as 'Prochaine destination' and recolor footer"
```

No `tailwind-build.css` rebuild needed.

---

### Task 9: CV modal + Toasts

**Files:**
- Modify: `index.html:972-992` (`#cv-modal` static shell — close-button icon)
- Modify: `js/app.js:459-582` (`openCvModal()`), `js/app.js:37-71` (`showToast()`)
- Modify: `css/overlays.css` (`.toast*` rules replaced; new `.cv-sheet` rules appended)

**Interfaces:**
- Consumes: `renderIcon()` (Task 1).
- Produces: nothing consumed elsewhere (last content task before final verification).

- [ ] **Step 1: Update the CV modal shell's close button**

Replace `index.html` lines 972-988 similarly to Task 7 Step 1 — the close button becomes:

```html
        <button class="modal-close" id="close-cv-modal" aria-label="Fermer la modale"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg></button>
```

(Same literal `close` icon markup as Task 7 — static HTML, can't call `renderIcon()` at parse time.)

- [ ] **Step 2: Rewrite `openCvModal()` in `js/app.js`**

Replace lines 459-582 (the full body from `const openCvModal = () => {` through its closing `};`) with:

```js
    const openCvModal = () => {
        if (!cvModal || !cvModalContent) return;

        const cv = PORTFOLIO_DATA.cv;
        if (!cv) return;

        const skillsBadges = cv.skills.map(s => `<span class="tech-pill">${s}</span>`).join('');
        const languagesList = cv.languages.map(l => `<li>${l}</li>`).join('');

        const experiencesList = cv.experiences.map(exp => `
            <div class="cv-entry">
                <div class="cv-entry-top">
                    <h5>${exp.role}</h5>
                    <span class="mono">${exp.dates}</span>
                </div>
                <span class="cv-entry-org">${exp.company}</span>
                <p>${exp.description}</p>
            </div>
        `).join('');

        const formationsList = cv.formations.map(f => `
            <div class="cv-entry">
                <div class="cv-entry-top">
                    <h5>${f.degree}</h5>
                    <span class="mono">${f.dates}</span>
                </div>
                <span class="cv-entry-org">${f.school}</span>
            </div>
        `).join('');

        cvModalContent.innerHTML = `
            <div class="cv-sheet">
                <div class="cv-header">
                    <div>
                        <h2>${cv.identity.name}</h2>
                        <p class="cv-role">${cv.identity.role}</p>
                        <p class="cv-availability">${cv.identity.availability}</p>
                    </div>
                    <button class="btn btn-primary" id="download-pdf-btn">${renderIcon('download')} Télécharger le CV PDF</button>
                </div>

                <div class="cv-grid">
                    <div class="cv-col">
                        <h4>Contact</h4>
                        <ul class="cv-contact-list">
                            <li>${renderIcon('mail')} ${cv.contact.email}</li>
                            <li>${renderIcon('phone')} ${cv.contact.phone}</li>
                            <li>${renderIcon('location')} ${cv.contact.location}</li>
                        </ul>
                        <h4>Compétences clés</h4>
                        <div class="tech-row">${skillsBadges}</div>
                        <h4>Langues</h4>
                        <ul class="cv-lang-list">${languagesList}</ul>
                    </div>
                    <div class="cv-col cv-col-wide">
                        <h4>Expériences professionnelles</h4>
                        <div class="cv-entries">${experiencesList}</div>
                        <h4>Formations</h4>
                        <div class="cv-entries">${formationsList}</div>
                    </div>
                </div>
            </div>
        `;

        cvModal.classList.add('active');
        cvModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        const downloadPdfBtn = document.getElementById('download-pdf-btn');
        if (downloadPdfBtn) {
            downloadPdfBtn.addEventListener('click', () => {
                downloadPdfBtn.disabled = true;
                downloadPdfBtn.innerHTML = `${renderIcon('sync', 'icon-spin')} Génération...`;

                setTimeout(() => {
                    downloadPdfBtn.disabled = false;
                    downloadPdfBtn.innerHTML = `${renderIcon('download')} Télécharger le CV PDF`;
                    closeCvModal();
                    showToast("Génération du CV réussie ! Téléchargement démarré.", "success");
                }, 1400);
            });
        }
    };
```

(`closeCvModal` below this in the file is unchanged — same ids, no edit needed.)

- [ ] **Step 3: Rewrite `showToast()` in `js/app.js`**

Replace lines 37-71 (the full body of `showToast`) with:

```js
    const showToast = (message, type = 'info') => {
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const iconName = type === 'success' ? 'check' : type === 'error' ? 'error' : 'info';

        toast.innerHTML = `
            ${renderIcon(iconName, 'toast-icon')}
            <div class="toast-message">${message}</div>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 50);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 4000);
    };
```

(Same public behavior/timing as before — 50ms show delay, 4s display, 400ms exit transition — only the internal markup/icon source changed. Also note: two existing call sites pass trailing emoji in their message strings, e.g. `showToast("Votre message a bien été envoyé ! Je vous répondrai sous 24h. ✉️", "success")` in the contact-form handler and `"Portfolio mis à jour en temps réel ! ⚡"` in the storage listener. Leave those emoji as-is — they are message *content* from existing call sites, not icons this task touches; removing them would be an unrequested content change outside this task's scope.)

- [ ] **Step 4: Rewrite `.toast*` and add `.cv-sheet` rules in `css/overlays.css`**

Replace lines 101-165 (the entire "3. SYSTÈME DE NOTIFICATIONS FLOTTANTES" section, from the section comment through the closing `html.dark .toast.info` rule) with:

```css
/* ==========================================================================
   3. NOTIFICATIONS FLOTTANTES (TOASTS)
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
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 14px;
    color: var(--ink);
    transform: translateY(40px) scale(0.96);
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast.show {
    transform: translateY(0) scale(1);
    opacity: 1;
}

.toast-icon {
    width: 22px;
    height: 22px;
    flex: none;
    color: var(--accent);
}
.toast.error .toast-icon {
    color: #e0745e;
}
.toast-message {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--ink);
}
```

(No colored side border on the toast — a thick accent border on one edge of a card is a recognizable generic-AI-UI pattern, and it's redundant here anyway: the icon already carries the semantic state, gold for success/info, warm red for error, matching `.toast.error .toast-icon`'s color above. A plain neutral `border: 1px solid var(--line)` is enough structure; state lives in the icon, not decoration on the frame.)

Then append:

```css

/* ==========================================================================
   5. FICHE DE CV (modale CV)
   ========================================================================== */
.cv-sheet {
    display: flex;
    flex-direction: column;
    gap: 24px;
}
.cv-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    border-bottom: 1px solid var(--line);
    padding-bottom: 20px;
}
.cv-header h2 {
    font-family: 'Space Grotesk', -apple-system, sans-serif;
    font-size: 1.3rem;
    color: var(--ink);
}
.cv-role {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--ink);
    margin-top: 4px;
}
.cv-availability {
    font-size: 12px;
    color: var(--accent-ink);
    margin-top: 2px;
}
.cv-grid {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 28px;
}
.cv-col h4 {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .05em;
    text-transform: uppercase;
    color: var(--accent-ink);
    margin: 20px 0 10px;
}
.cv-col h4:first-child {
    margin-top: 0;
}
.cv-contact-list, .cv-lang-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 12.5px;
    color: var(--ink-70);
    list-style: none;
    margin: 0;
    padding: 0;
}
.cv-contact-list li {
    display: flex;
    align-items: center;
    gap: 7px;
}
.cv-contact-list .icon {
    width: 13px;
    height: 13px;
    color: var(--accent);
}
.cv-entries {
    display: flex;
    flex-direction: column;
    gap: 14px;
}
.cv-entry-top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 10px;
}
.cv-entry h5 {
    font-size: 13.5px;
    font-weight: 700;
    color: var(--ink);
}
.cv-entry-top .mono {
    font-size: 11.5px;
    color: var(--accent-ink);
    white-space: nowrap;
}
.cv-entry-org {
    font-size: 12px;
    color: var(--ink-70);
    font-style: italic;
}
.cv-entry p {
    font-size: 12.5px;
    color: var(--ink-70);
    line-height: 1.55;
    margin-top: 4px;
}
@media (max-width: 700px) {
    .cv-grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 5: Visual check**

Serve and open the site. Click "Mon CV" in the nav:
- Confirm the CV sheet renders (identity header + download button, Contact/Compétences/Langues left column, Expériences/Formations right column), all on the dark palette.
- Click "Télécharger le CV PDF": confirm the button shows a spinning sync icon + "Génération...", then after ~1.4s the modal closes and a success toast appears (gold check icon, message, neutral border).
- Trigger an error toast by submitting the contact form with an invalid email (e.g. "test" with no `@`): confirm the toast shows with the error icon.
- No console errors.

- [ ] **Step 6: Commit**

```bash
git add index.html css/overlays.css js/app.js
git commit -m "feat: restyle CV modal and toast notifications"
```

No `tailwind-build.css` rebuild needed.

---

### Task 10: Final verification pass

**Files:**
- No new files. Reviews/fixes across `index.html`, `js/app.js`, `css/*.css` as needed based on findings below.

**Interfaces:**
- Consumes: everything from Tasks 1-9.
- Produces: nothing (final gate before `finishing-a-development-branch`).

- [ ] **Step 1: Re-verify the full identifier contract**

Open the spec (`docs/superpowers/specs/2026-08-10-portfolio-carte-celeste-redesign-design.md`, §7) and, for each id/class/data-attribute listed, grep `index.html` and `js/app.js` to confirm it still exists with the same name:

```bash
for id in navbar scroll-progress nav-logo menu-toggle mobile-nav-overlay hero hero-availability hero-title hero-description hero-img hero-badge-1 hero-badge-2 about-story-title about-paragraphs about-journey-1 about-journey-2 about-education-container about-values-container skills skills-categories-container projects-grid project-modal close-project-modal project-modal-content cv-btn cv-modal close-cv-modal cv-modal-content contact-email-link contact-location-text contact-github-link contact-linkedin-link footer-logo footer-copyright contact-form form-name form-email form-subject form-message-text form-message toast-container; do
  grep -q "id=\"$id\"" index.html || echo "MISSING: $id"
done
```

Expected: no output (every id found). If anything prints, fix the missing id before continuing — do not proceed with a broken contract.

Separately confirm by reading (not grep, since these are class/data-attribute patterns, not literal ids): `.mobile-nav-link`, `data-tab`/`#tab-journey`/`#tab-edu`/`#tab-core`, `.skill-bar-fill`/`data-percent`, `.filter-btn`/`data-filter`, `data-category`/`data-project-id` on the project cards.

- [ ] **Step 2: Confirm `mouse-glow`/`parallax-bg` are fully gone**

```bash
grep -rn "mouse-glow\|parallax-bg\|material-symbols" index.html js/app.js css/*.css
```

Expected: no output. Any hit is a leftover from Tasks 1-3 that must be removed.

- [ ] **Step 2b: Clean up three small items flagged during Task 3's review**

1. **Dead CSS in `css/animations.css`**: Task 3 removed the only markup that used `.floating`, `@keyframes float`, and `@keyframes bounce-y` (the old floating portrait wrapper and bouncing hero badges). Confirm with `grep -rn "floating\|bounce-y" index.html js/app.js css/*.css` that only `css/animations.css` itself defines them and nothing references them anymore, then delete all three rules from `css/animations.css`.
2. **Stale comment in `css/utilities.css:4-5`**: the file header still says "...le halo lumineux de souris" (the mouse-glow effect Task 3 replaced with the star canvas). Update it to describe the current contents (scroll progress bar + star canvas positioning).
3. **Reduced-motion canvas blanks on resize**: in `js/app.js`'s `initHeroCanvas()`, the `resize()` function calls `initStars()` but never repaints, so a reduced-motion user who resizes the window after load sees a blank hero canvas until (never, since the rAF loop never started) it's redrawn. Find `function resize(){ ... initStars(); }` inside `initHeroCanvas()` and add a call to `drawFrame()` at the end of `resize()`:

```js
        function resize() {
            const rect = heroEl.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
            initStars();
            drawFrame();
        }
```

This draws one fresh frame after every resize regardless of motion preference — harmless for non-reduced-motion users (the rAF loop keeps redrawing over it immediately after) and closes the gap for reduced-motion users (who now get a correct static frame after resize instead of a blank canvas). Note `drawFrame` is declared as a function inside the same `initHeroCanvas()` closure, after `resize`'s current definition — moving `resize`'s call site doesn't require reordering the function declarations themselves (function declarations are hoisted within the closure).

- [ ] **Step 3: Contrast spot-check**

Using the values from spec §3.1 (already computed and documented there — `--ink` on `--bg` ≈15.3:1, `--ink-70` ≈8.4:1, `--ink-45` ≈4.98:1, `--accent` ≈8:1), visually confirm in a browser with DevTools' contrast checker (right-click an element with `--ink-45` text, e.g. `.field-key` or `.footer-copy`, inspect computed color, use the browser's built-in contrast ratio display) that the smallest/lightest text (`.field-key`, `.footer-copy`, `.tl-date`) is still legible against its `var(--bg)`/`var(--bg-2)` background. If any spot-check reads below 4.5:1, stop and report the discrepancy rather than adjusting blindly (it would mean a computed value in the spec doesn't match what actually shipped — re-check the CSS custom property value first, since a typo there is more likely than the spec's math being wrong).

- [ ] **Step 4: Touch target check**

Using DevTools' element inspector, confirm the clickable box (not just the visible icon) of `#menu-toggle`, `.filter-btn`, `.rubrique-btn`, `.nav-link`, and `.modal-close` all measure at least 44×44px, OR have at least 44×44px of effective hit area via padding even if the visible glyph is smaller. `.rubrique-btn` in particular has no horizontal padding in Task 4's CSS (only `padding: 0 0 12px`) — its clickable width is only as wide as its text, which is acceptable (WCAG's 44×44 target-size guidance applies to the *minimum* dimension and has an exception for inline text links where the target is constrained by the line of text — `.rubrique-btn` sits in a row of short text labels, not an isolated tap target), but its *height* must still reach 44px counting the row it sits in; if it measures under 44px tall including surrounding whitespace, add `padding-top: 10px` to `.rubrique-btn` and adjust `.rubriques`' `margin-bottom` down by the same amount to keep the section's overall spacing rhythm.

- [ ] **Step 5: Confirm `tailwind-build.css` is still in sync**

Even though no task in this plan added/removed a Tailwind-recognized utility class, verify this assumption held in practice (a task may have inadvertently left one behind, e.g. a stray `bg-primary` copy-pasted from the old markup):

```bash
npm run build:css
git status --short css/tailwind-build.css
```

Expected: no output from `git status` (the regenerated file is byte-identical to the committed one, confirming no Tailwind-relevant class changed across all 9 prior tasks). If it shows a diff, inspect it: if the diff is meaningful (a color/utility actually changed), commit the regenerated file now. If it's pure noise (e.g. only a build timestamp comment, if the CLI emits one — check the diff content first), commit it anyway to keep the tree clean.

- [ ] **Step 6: Full-page manual walkthrough**

Serve the site and click through every interactive element once, end to end: nav links (desktop + mobile burger), CV modal open/download/close, hero CTA buttons, About rubriques (all 3), Skills scroll-in animation, Projects filter (all 3 filters) + open/close a project modal (one with real demo/source links, one without), Contact form (trigger both a validation error and, if you're comfortable sending a real test message, a real submission — otherwise stop at the validation-error toast), footer links. Confirm no console errors appear at any point and no element visibly retains old Material-You colors (purple/light-blue) or a Material Symbols ligature word (e.g. literal text "close" or "menu" instead of an icon — a sure sign an icon lookup silently failed).

- [ ] **Step 7: Commit (only if Steps 3-5 produced fixes)**

```bash
git add -A
git commit -m "fix: final verification pass — identifier contract, contrast, touch targets"
```

If no fixes were needed, skip this step (nothing to commit).

---

## Self-Review Notes

- **Spec coverage:** §5.1-§5.10 each map to one task (5.1→Task2, 5.2→Task3, 5.3→Task4, 5.4→Task5, 5.5→Task6+7, 5.6-5.7→Task8, 5.8-5.9→Task9, 5.10 stays disabled/untouched). §3 (tokens/fonts) → Task 1. §4 (image treatment, "no filter") is satisfied by omission: Tasks 3 (`.postcard-viewport img`), 6 (`.stop-viewport img`) and 7 (`.article-image img`) never add a grayscale/halftone filter rule — confirmed by re-reading each task's CSS above, no dedicated task needed since the requirement is "do nothing" to the image. §6 (animations) is threaded through Tasks 2, 3, 6. §7 (identifier contract) is the explicit final check, Task 10. §9 (accessibility) is checked in Task 10 Steps 3-4.
- **Type/name consistency verified across tasks:** `renderIcon(name, extraClass)` signature (Task 1) is called identically in Tasks 2, 3, 6, 7, 8, 9. `.stop-card`/`.stop-viewport`/`.stop-body`/`.stop-cat` (Task 6) are not redefined or renamed by any later task. `.tl-item`/`.tl-date`/`.tl-title`/`.tl-desc` (Task 4) likewise. CSS custom property names (`--bg`, `--bg-2`, `--bg-3`, `--ink`, `--ink-70`, `--ink-45`, `--line`, `--accent`, `--accent-ink`, `--radius`) are defined once in Task 1 and referenced verbatim in every later task's CSS — no task introduces a differently-spelled variant.
- **Placeholder scan:** no task contains "TBD"/"add error handling"/"similar to Task N" — every step either shows the literal code to write or the literal shell command to run.
