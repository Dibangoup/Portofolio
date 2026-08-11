# Dashboard — Carte Céleste Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the admin dashboard's live-preview panel and skill-icon field back in sync with the "Carte Céleste" redesign the public site shipped on 2026-08-10/11, and fix a pre-existing bug that breaks scroll-reveal after a live dashboard edit.

**Architecture:** Four independent, sequential edits to `dashboard.html` / `css/dashboard.css` (preview-panel CSS restyle, preview-panel HTML/JS expansion, icon-picker HTML/CSS/JS) and one isolated edit to `js/app.js` (a variable-scope fix). No new files, no schema changes, no build step (dashboard.html is plain HTML/CSS/JS, no bundler).

**Tech Stack:** Vanilla HTML/CSS/JS (no framework), Tailwind utility classes for dashboard chrome (compiled, untouched by this plan), Google Fonts CDN, `js/icons.js` (existing inline-SVG icon library from the Carte Céleste redesign).

## Global Constraints

- `js/portfolio-data.js` — schema never changes shape. This plan only reads from `PORTFOLIO_DATA`, never restructures it.
- No existing `id` is renamed. New `id`s introduced: `mock-about-title`, `mock-about-text`, `mock-contact`.
- The dashboard's own visual identity (`:root` tokens `--primary-color`, `--bg-dark`, `--teal`, etc., the rail nav, the command palette) is **not** touched — except Task 3's icon-picker buttons, which deliberately use these existing dashboard tokens (not the new Carte Céleste tokens), because that control is dashboard UI chrome, not a reproduction of the public site.
- New Carte Céleste-matching tokens (`--cc-bg`, `--cc-bg-2`, `--cc-ink`, `--cc-ink-70`, `--cc-ink-45`, `--cc-line`, `--cc-accent`, `--cc-accent-ink`) are scoped to `.preview-col` only — never added to the dashboard's global `:root`.
- Exact Carte Céleste color values (copied from `css/glass.css`'s `:root`, the site's source of truth): `--bg:#0F1B2E`, `--bg-2:#16273D`, `--ink:#F3F1E8`, `--ink-70:rgba(243,241,232,.72)`, `--ink-45:rgba(243,241,232,.52)`, `--line:rgba(243,241,232,.14)`, `--accent:#E8A23C`, `--accent-ink:#F0B65E`.
- No automated test suite exists for this project. Every task's verification step is a manual/Playwright check against the real rendered page.
- **Never click the dashboard's "Enregistrer" button, and never trigger `/api/save`, during any verification step in this plan.** The dashboard's save button overwrites the real `js/portfolio-data.js` on disk. Every verification in this plan is read-only: inspect the DOM, computed styles, and take screenshots — never submit a save.
- The dashboard is protected by real HTTP Basic Auth (`server.js`, credentials in `.env`). To view it during verification, read `DASHBOARD_USER`/`DASHBOARD_PASSWORD` directly from the local `.env` file and use them only within your own tool calls (e.g. a Playwright navigation URL or a `curl`/auth header). **Never paste the actual credential values into any file that gets committed** (this plan, a report, a commit message, etc.) — reference them as "read from `.env`" instead.

---

### Task 1: Restyle the live-preview panel (Hero / Compétences / Projets)

**Files:**
- Modify: `css/dashboard.css` (the `.mock-*` rule block, currently lines ~599-775)

**Interfaces:**
- Consumes: nothing new.
- Produces: 8 new CSS custom properties scoped to `.preview-col` (`--cc-bg`, `--cc-bg-2`, `--cc-ink`, `--cc-ink-70`, `--cc-ink-45`, `--cc-line`, `--cc-accent`, `--cc-accent-ink`) — Task 2 reuses these exact names for its new blocks.

- [ ] **Step 1: Add the Carte Céleste token block to `.preview-col`**

In `css/dashboard.css`, find the existing `.preview-col { ... }` rule (currently lines 599-607):

```css
.preview-col {
  position: sticky;
  top: 64px;
  height: calc(100vh - 64px);
  border-left: 1px solid var(--border-color);
  padding: 24px;
  overflow: auto;
  background: rgba(255, 255, 255, 0.012);
}
```

Replace it with (adds the 8 new custom properties, nothing else changes):

```css
.preview-col {
  position: sticky;
  top: 64px;
  height: calc(100vh - 64px);
  border-left: 1px solid var(--border-color);
  padding: 24px;
  overflow: auto;
  background: rgba(255, 255, 255, 0.012);
  --cc-bg: #0F1B2E;
  --cc-bg-2: #16273D;
  --cc-ink: #F3F1E8;
  --cc-ink-70: rgba(243, 241, 232, .72);
  --cc-ink-45: rgba(243, 241, 232, .52);
  --cc-line: rgba(243, 241, 232, .14);
  --cc-accent: #E8A23C;
  --cc-accent-ink: #F0B65E;
}
```

- [ ] **Step 2: Restyle `.mock-frame` and `.mock-hero`**

Find and replace:

```css
.mock-frame {
  background: #050409;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  margin-bottom: 18px;
}

.mock-hero {
  padding: 30px 22px;
  text-align: center;
  background: radial-gradient(340px 240px at 50% -20%, rgba(53, 37, 205, 0.35), transparent 70%);
}
```

with:

```css
.mock-frame {
  background: var(--cc-bg);
  border: 1px solid var(--cc-line);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  margin-bottom: 18px;
}

.mock-hero {
  padding: 30px 22px;
  text-align: center;
  background: var(--cc-bg);
}
```

- [ ] **Step 3: Restyle `.mock-avatar`, `.mock-badge`, `.mock-title`, `.mock-role`, `.mock-desc`, `.mock-floaters span`**

Find and replace:

```css
.mock-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  margin: 0 auto 12px;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.15);
  background: #1b1930;
}

.mock-badge {
  display: inline-block;
  font-size: 9.5px;
  padding: 3px 10px;
  border-radius: 99px;
  background: var(--teal-soft);
  color: var(--teal);
  border: 1px solid rgba(45, 217, 194, 0.3);
  margin-bottom: 10px;
}

.mock-title {
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 17px;
  font-weight: 800;
  line-height: 1.25;
  margin: 0 0 8px;
}

.mock-role {
  font-size: 11px;
  color: var(--primary-container);
  font-weight: 600;
  margin-bottom: 8px;
}

.mock-desc {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.6;
}

.mock-floaters {
  display: flex;
  gap: 6px;
  justify-content: center;
  margin-top: 14px;
  flex-wrap: wrap;
}

.mock-floaters span {
  font-size: 9px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  padding: 3px 8px;
  border-radius: 99px;
}
```

with:

```css
.mock-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  margin: 0 auto 12px;
  object-fit: cover;
  border: 1px solid var(--cc-line);
  background: var(--cc-bg-2);
}

.mock-badge {
  display: inline-block;
  font-size: 9.5px;
  padding: 3px 10px;
  border-radius: 99px;
  background: transparent;
  color: var(--cc-accent);
  border: 1px solid var(--cc-accent);
  margin-bottom: 10px;
}

.mock-title {
  font-family: 'Space Grotesk', -apple-system, sans-serif;
  font-size: 17px;
  font-weight: 800;
  line-height: 1.25;
  margin: 0 0 8px;
  color: var(--cc-ink);
}

.mock-role {
  font-size: 11px;
  color: var(--cc-accent-ink);
  font-weight: 600;
  margin-bottom: 8px;
}

.mock-desc {
  font-size: 11px;
  color: var(--cc-ink-70);
  line-height: 1.6;
}

.mock-floaters {
  display: flex;
  gap: 6px;
  justify-content: center;
  margin-top: 14px;
  flex-wrap: wrap;
}

.mock-floaters span {
  font-size: 9px;
  background: var(--cc-bg-2);
  border: 1px solid var(--cc-line);
  color: var(--cc-ink-70);
  padding: 3px 8px;
  border-radius: 99px;
}
```

(`.mock-title` gained an explicit `color: var(--cc-ink)` — the old rule relied on inheriting `var(--text-primary)` from `body.dashboard-body`, which happens to be a near-white too, but that was incidental, not intentional; setting it explicitly keeps this block self-contained.)

- [ ] **Step 4: Restyle skill rows and project cards**

Find and replace:

```css
.mock-skill-row .name {
  flex: 0 0 96px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mock-skill-row .bar {
  flex: 1;
  height: 5px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.mock-skill-row .bar i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--primary-container), var(--teal));
  border-radius: 4px;
}
```

with:

```css
.mock-skill-row .name {
  flex: 0 0 96px;
  color: var(--cc-ink-70);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mock-skill-row .bar {
  flex: 1;
  height: 5px;
  border-radius: 4px;
  background: var(--cc-line);
  overflow: hidden;
}

.mock-skill-row .bar i {
  display: block;
  height: 100%;
  background: var(--cc-accent);
  border-radius: 4px;
}
```

Find and replace:

```css
.mock-proj-card {
  border: 1px solid var(--border-color);
  border-radius: 10px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.02);
}

.mock-proj-thumb {
  height: 44px;
  background-size: cover;
  background-position: center;
  background-color: rgba(53, 37, 205, 0.2);
}

.mock-proj-name {
  font-size: 9.5px;
  padding: 6px 7px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

with:

```css
.mock-proj-card {
  border: 1px solid var(--cc-line);
  border-radius: 10px;
  overflow: hidden;
  background: var(--cc-bg-2);
}

.mock-proj-thumb {
  height: 44px;
  background-size: cover;
  background-position: center;
  background-color: var(--cc-bg-2);
}

.mock-proj-name {
  font-size: 9.5px;
  padding: 6px 7px;
  color: var(--cc-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

`.preview-head`, `.preview-head h3`, `.mock-block-title`, `.preview-note`, `.badge-live`, and the outer `.preview-col` background stay exactly as they are — do not touch them, they're dashboard chrome, not a site reproduction.

- [ ] **Step 5: Load Space Grotesk (weight 700) for `.mock-title`**

In `dashboard.html`, find the existing Google Fonts `<link>` (in `<head>`):

```html
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=Plus+Jakarta+Sans:wght@700;800&amp;display=swap"
      rel="stylesheet"
    />
```

Replace with (adds `Space+Grotesk:wght@700` to the same request — one extra font family in the existing CDN URL, no new `<link>` tag):

```html
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=Plus+Jakarta+Sans:wght@700;800&amp;family=Space+Grotesk:wght@700&amp;display=swap"
      rel="stylesheet"
    />
```

- [ ] **Step 6: Visual verification**

Read `DASHBOARD_USER` and `DASHBOARD_PASSWORD` from `.env` (do not write the values into any file). Start the local server (`node server.js` from the `Portofolio/` directory), then use Playwright to navigate to `http://<user>:<password>@localhost:3000/dashboard.html` (substituting the real values only in the tool call, never in a file). Confirm via a screenshot of the "Général & Accueil" tab (the default tab, no navigation needed):
- The preview panel's hero mock now has a navy background (no violet gradient), gold role text, gold outline availability badge, Space Grotesk title font.
- Switch to the "Compétences" tab (`goTab('skills')` via `browser_evaluate`) and confirm the skill bars in the preview are a flat gold fill, not a violet→cyan gradient.
- Switch to the "Projets" tab (`goTab('projects')`) and confirm project card thumbnails have a navy fallback background, not violet.
- 0 console errors.
- **Do not click "Enregistrer" at any point.** Stop the local server when done.

- [ ] **Step 7: Commit**

```bash
git add css/dashboard.css dashboard.html
git commit -m "style: restyle dashboard live-preview panel to match Carte Celeste tokens"
```

---

### Task 2: Expand the live-preview panel with À propos and Contact blocks

**Files:**
- Modify: `dashboard.html` (the `<aside class="preview-col">` markup, currently lines ~523-548; the `fillAboutForm()`, `fillContactForm()`, and `loadData()` functions)
- Modify: `css/dashboard.css` (append new rules after the `.mock-proj-*` block Task 1 already restyled)

**Interfaces:**
- Consumes: the `--cc-*` custom properties Task 1 added to `.preview-col`.
- Produces: `syncAboutPreview()` and `syncContactPreview()` — no other task calls these.

- [ ] **Step 1: Add the new preview blocks to the markup**

In `dashboard.html`, find (inside `<aside class="preview-col" id="preview-col">`):

```html
            <div class="mock-block-title">Projets</div>
            <div class="mock-proj-grid" id="mock-projects-preview"></div>

            <div class="preview-note">Reflète en direct l'onglet « Général », et les listes « Compétences » / « Projets » à mesure que vous les modifiez ou réordonnez.</div>
```

Replace with:

```html
            <div class="mock-block-title">Projets</div>
            <div class="mock-proj-grid" id="mock-projects-preview"></div>

            <div class="mock-block-title">À propos</div>
            <div class="mock-about">
              <div class="mock-about-title" id="mock-about-title"></div>
              <p class="mock-about-text" id="mock-about-text"></p>
            </div>

            <div class="mock-block-title">Contact</div>
            <div class="mock-contact" id="mock-contact"></div>

            <div class="preview-note">Reflète en direct les onglets « Général », « À propos », « Compétences », « Projets » et « Contact » à mesure que vous les modifiez.</div>
```

- [ ] **Step 2: Append the new CSS rules**

In `css/dashboard.css`, immediately after the `.mock-proj-name { ... }` rule (the last rule Task 1 touched), append:

```css

.mock-about-title {
  font-family: 'Space Grotesk', -apple-system, sans-serif;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--cc-ink);
  margin-bottom: 6px;
}

.mock-about-text {
  font-size: 10.5px;
  color: var(--cc-ink-70);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.mock-contact {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mock-contact-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 10px;
  padding: 6px 0;
  border-bottom: 1px solid var(--cc-line);
}

.mock-contact-row:last-child {
  border-bottom: none;
}

.mock-contact-row .k {
  color: var(--cc-ink-45);
  text-transform: uppercase;
  letter-spacing: .04em;
}

.mock-contact-row .v {
  color: var(--cc-ink);
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 60%;
}
```

- [ ] **Step 3: Add the two new sync functions**

In `dashboard.html`'s inline `<script>`, find the existing `syncProjectsPreview()` function (it ends with a closing `}` followed by a blank line and the comment `// GENERAL FORM FILL`):

```js
      function syncProjectsPreview() {
        const el = document.getElementById('mock-projects-preview');
        if (!el) return;
        const projects = PORTFOLIO_DATA.projects || [];
        el.innerHTML = projects.length ? projects.slice(0, 4).map(p => `
          <div class="mock-proj-card">
            <div class="mock-proj-thumb" style="background-image:url('${escapeHtml(p.image || '')}')"></div>
            <div class="mock-proj-name">${escapeHtml(p.cardTitle || 'Sans titre')}</div>
          </div>`).join('') : '<p class="preview-note" style="margin:0;">Aucun projet pour l\'instant.</p>';
      }
```

Immediately after it (before the `// GENERAL FORM FILL` comment), insert:

```js

      function syncAboutPreview() {
        document.getElementById('mock-about-title').textContent = document.getElementById('about-title').value;
        document.getElementById('mock-about-text').textContent = document.getElementById('about-p1').value;
      }

      function syncContactPreview() {
        const el = document.getElementById('mock-contact');
        if (!el) return;
        const rows = [
          ['Email', document.getElementById('contact-email').value],
          ['Lieu', document.getElementById('contact-location').value],
        ];
        el.innerHTML = rows.map(([k, v]) => `
          <div class="mock-contact-row">
            <span class="k">${escapeHtml(k)}</span>
            <span class="v">${escapeHtml(v || '—')}</span>
          </div>`).join('');
      }
```

- [ ] **Step 4: Call the new sync functions from their forms' fill functions**

Find `fillAboutForm()`:

```js
      function fillAboutForm() {
        const a = PORTFOLIO_DATA.about;
        if (!a) return;
        document.getElementById('about-title').value = a.title || '';
        document.getElementById('about-p1').value = a.paragraphs ? a.paragraphs[0] || '' : '';
        document.getElementById('about-p2').value = a.paragraphs ? a.paragraphs[1] || '' : '';
        document.getElementById('about-journey-text1').value = a.journey ? a.journey.text1 || '' : '';
        document.getElementById('about-journey-text2').value = a.journey ? a.journey.text2 || '' : '';

        // Render lists
        renderValuesEditor();
        renderEducationEditor();
      }
```

Replace with (adds one line before the closing brace):

```js
      function fillAboutForm() {
        const a = PORTFOLIO_DATA.about;
        if (!a) return;
        document.getElementById('about-title').value = a.title || '';
        document.getElementById('about-p1').value = a.paragraphs ? a.paragraphs[0] || '' : '';
        document.getElementById('about-p2').value = a.paragraphs ? a.paragraphs[1] || '' : '';
        document.getElementById('about-journey-text1').value = a.journey ? a.journey.text1 || '' : '';
        document.getElementById('about-journey-text2').value = a.journey ? a.journey.text2 || '' : '';

        // Render lists
        renderValuesEditor();
        renderEducationEditor();
        syncAboutPreview();
      }
```

Find `fillContactForm()`:

```js
      function fillContactForm() {
        const c = PORTFOLIO_DATA.contact;
        if (!c) return;
        document.getElementById('contact-email').value = c.email || '';
        document.getElementById('contact-location').value = c.location || '';
        document.getElementById('contact-github').value = c.github || '';
        document.getElementById('contact-linkedin').value = c.linkedin || '';
      }
```

Replace with:

```js
      function fillContactForm() {
        const c = PORTFOLIO_DATA.contact;
        if (!c) return;
        document.getElementById('contact-email').value = c.email || '';
        document.getElementById('contact-location').value = c.location || '';
        document.getElementById('contact-github').value = c.github || '';
        document.getElementById('contact-linkedin').value = c.linkedin || '';
        syncContactPreview();
      }
```

- [ ] **Step 5: Wire live input updates in `loadData()`**

Find, inside `loadData()`:

```js
        // Suit les modifications non enregistrées sur tous les champs de l'éditeur
        document.querySelector('.editor-col').addEventListener('input', markUnsavedChanges);
        document.getElementById('form-general').addEventListener('input', syncHeroPreview);
```

Replace with:

```js
        // Suit les modifications non enregistrées sur tous les champs de l'éditeur
        document.querySelector('.editor-col').addEventListener('input', markUnsavedChanges);
        document.getElementById('form-general').addEventListener('input', syncHeroPreview);
        document.getElementById('form-about').addEventListener('input', syncAboutPreview);
        document.getElementById('form-contact').addEventListener('input', syncContactPreview);
```

- [ ] **Step 6: Visual and interaction verification**

Start the server, navigate to the dashboard with Playwright (same auth approach as Task 1, credentials never written to a file). On the default "Général" tab:
- Confirm two new blocks appear at the bottom of the preview panel: "À propos" (title + first paragraph, styled with the Carte Céleste tokens) and "Contact" (Email/Lieu rows).
- Confirm the `.preview-note` text now mentions all 5 tabs.
- Type into the `#about-title` field (e.g. append " test") via Playwright and confirm `#mock-about-title` updates live without a page reload.
- Type into `#contact-email` and confirm `#mock-contact`'s Email row updates live.
- 0 console errors.
- **Do not click "Enregistrer".** Stop the server when done. (Typed test values are in-memory only and vanish on reload since nothing was saved — safe.)

- [ ] **Step 7: Commit**

```bash
git add dashboard.html css/dashboard.css
git commit -m "feat: add About and Contact blocks to dashboard live-preview panel"
```

---

### Task 3: Real icon picker for skill category icons

**Files:**
- Modify: `dashboard.html` (add a `<script>` tag; the icon `<input>` inside `renderSkillsEditor()`, currently around line 1046-1049; `updateCategoryIcon()`, currently around line 1078-1080)
- Modify: `css/dashboard.css` (append new rules)

**Interfaces:**
- Consumes: `ICONS` / `renderIcon(name, extraClass)` from `js/icons.js` (existing, from the Carte Céleste redesign — `renderIcon('palette')` etc. returns an SVG string).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Load `js/icons.js` in the dashboard**

In `dashboard.html`'s `<head>`, find:

```html
    <!-- Script de données par défaut -->
    <script src="js/portfolio-data.js"></script>
  </head>
```

Replace with:

```html
    <!-- Script de données par défaut -->
    <script src="js/portfolio-data.js"></script>
    <!-- Bibliothèque d'icônes SVG (partagée avec le site public, voir js/icons.js) -->
    <script src="js/icons.js"></script>
  </head>
```

- [ ] **Step 2: Replace the icon `<input>` with an icon-button picker**

Inside `renderSkillsEditor()` in `dashboard.html`, find:

```html
                <div>
                  <label class="text-[10px] text-white/50 block mb-1">Icône Google Material (ex: database, code)</label>
                  <input type="text" class="admin-input py-2 px-3 text-sm" value="${escapeHtml(cat.icon || 'star')}" onchange="updateCategoryIcon(${catIdx}, this.value)" />
                </div>
```

Replace with:

```html
                <div>
                  <label class="text-[10px] text-white/50 block mb-1">Icône de la catégorie</label>
                  <div class="icon-picker">
                    ${['palette', 'database', 'smartphone', 'star'].map(name => `
                      <button type="button"
                              class="icon-picker-btn${(cat.icon || 'star') === name ? ' active' : ''}"
                              onclick="updateCategoryIcon(${catIdx}, '${name}')"
                              title="${name}">
                        ${renderIcon(name)}
                      </button>
                    `).join('')}
                  </div>
                </div>
```

- [ ] **Step 3: Make `updateCategoryIcon()` re-render so the `.active` state updates**

Find:

```js
      function updateCategoryIcon(catIdx, val) {
        PORTFOLIO_DATA.skills[catIdx].icon = val;
      }
```

Replace with:

```js
      function updateCategoryIcon(catIdx, val) {
        PORTFOLIO_DATA.skills[catIdx].icon = val;
        renderSkillsEditor();
      }
```

- [ ] **Step 4: Append the icon-picker CSS**

In `css/dashboard.css`, append at the end of the file:

```css

.icon-picker {
  display: flex;
  gap: 8px;
}
.icon-picker-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color .15s, color .15s;
}
.icon-picker-btn:hover {
  color: var(--text-primary);
}
.icon-picker-btn.active {
  border-color: var(--primary-container);
  color: var(--primary-container);
}
.icon-picker-btn svg {
  width: 18px;
  height: 18px;
}
```

- [ ] **Step 5: Verification**

Start the server, navigate to the dashboard with Playwright, switch to the "Compétences" tab (`goTab('skills')`). Confirm:
- Each skill category shows 4 clickable icon buttons (palette/database/smartphone/star) instead of a text input, each rendering a real SVG glyph.
- The button matching the category's current `icon` value has the `.active` style (colored border/icon).
- Clicking a different icon button updates `PORTFOLIO_DATA.skills[catIdx].icon` (verify via `browser_evaluate` reading `PORTFOLIO_DATA.skills[0].icon` after a click) and moves the `.active` style to the clicked button.
- No `renderIcon is not defined` or similar console error (confirms `js/icons.js` loaded correctly before it's used).
- 0 console errors overall.
- **Do not click "Enregistrer".** Stop the server when done — the icon change made during this check is in-memory only.

- [ ] **Step 6: Commit**

```bash
git add dashboard.html css/dashboard.css
git commit -m "feat: replace free-text skill-category icon field with a visual icon picker"
```

---

### Task 4: Fix scroll-reveal breaking after a live dashboard edit

**Files:**
- Modify: `js/app.js` (the `revealObserver` declaration, currently lines ~600-617)

**Interfaces:**
- Consumes: nothing new.
- Produces: `revealObserver` becomes visible at the enclosing `DOMContentLoaded` callback's scope — `renderAll()` (line ~473, unchanged by this task) already reads it via `typeof revealObserver !== 'undefined' && revealObserver`, and will now actually find it.

- [ ] **Step 1: Declare `revealObserver` near the top of the function, before it's ever called**

**Critical ordering detail:** `renderAll()` is defined at line ~464 and called for the first time at line ~479 ("Premier rendu au chargement de la page") — both **before** the reveal-observer setup block, which sits much later (~line 600). If `revealObserver` were declared with `let` right before that later `if` block (the naive fix), the *entire* enclosing `DOMContentLoaded` function scope would still hoist the `let` binding to the top for temporal-dead-zone purposes — meaning `renderAll()`'s `typeof revealObserver` check, executing at line 479, would run *before* line ~600's declaration statement is ever reached, and `typeof` on a `let`/`const` binding still inside its temporal dead zone throws `ReferenceError: Cannot access 'revealObserver' before initialization` (unlike `typeof` on a truly-undeclared identifier, which safely returns `'undefined'`). Declaring it late would turn a silent pre-existing bug into a crash on every single page load. The declaration must go near the top of the function, before `renderAll` is defined, not just before the `if` block that assigns it.

First, in `js/app.js`, find (near the top of the `DOMContentLoaded` callback):

```js
    // Détecte si l'utilisateur a activé l'option de réduction des animations au niveau de son OS (accessibilité)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

Replace with (adds one declaration immediately after):

```js
    // Détecte si l'utilisateur a activé l'option de réduction des animations au niveau de son OS (accessibilité)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Déclaré ici (avant renderAll(), appelé plus bas) pour que renderAll() puisse le référencer
    // en toute sécurité dès le premier rendu — voir l'assignation réelle plus bas, §8 ANIMATIONS AU SCROLL.
    let revealObserver = null;
```

Second, further down, find:

```js
    if (!prefersReducedMotion) {
        const revealObserverOptions = {
            root: null, // Zone d'affichage correspond au viewport complet
            rootMargin: '0px 0px -50px 0px', // Se déclenche légèrement avant l'entrée physique à l'écran
            threshold: 0.1 // 10% de l'élément doit être visible
        };

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active'); // Ajoute la classe d'activation CSS
                    observer.unobserve(entry.target); // Cesse d'observer pour optimiser les performances
                }
            });
        }, revealObserverOptions);

        // Applique l'observateur sur chaque élément ayant la classe 'reveal'
        document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
    } else {
```

Replace with (only the declaration keyword on the observer line changes, from `const revealObserver =` to a bare `revealObserver =` — it's now a reassignment of the outer `let`, not a new block-scoped binding):

```js
    if (!prefersReducedMotion) {
        const revealObserverOptions = {
            root: null, // Zone d'affichage correspond au viewport complet
            rootMargin: '0px 0px -50px 0px', // Se déclenche légèrement avant l'entrée physique à l'écran
            threshold: 0.1 // 10% de l'élément doit être visible
        };

        revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active'); // Ajoute la classe d'activation CSS
                    observer.unobserve(entry.target); // Cesse d'observer pour optimiser les performances
                }
            });
        }, revealObserverOptions);

        // Applique l'observateur sur chaque élément ayant la classe 'reveal'
        document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
    } else {
```

Do not change `renderAll()` (line ~473) — its existing check `if (typeof revealObserver !== 'undefined' && revealObserver)` already does the right thing once `revealObserver` is declared early enough to be past its temporal dead zone by the time `renderAll()` runs: it evaluates falsy-but-safe (`null`) before the `if (!prefersReducedMotion)` block has run yet (e.g. during the very first `renderAll()` call at line ~479, which happens before line ~600), truthy once the real `IntersectionObserver` is assigned, and cleanly falsy (stays `null`, no error) when `prefersReducedMotion` was true throughout.

Verify the ordering yourself before moving on: confirm with `grep -n "let revealObserver\|const prefersReducedMotion\|const renderAll\|renderAll();\|revealObserver = new IntersectionObserver" js/app.js` that the new `let revealObserver = null;` line number is smaller than `renderAll`'s definition and first-call line numbers, which are in turn smaller than the `revealObserver = new IntersectionObserver(...)` line number. If that ordering doesn't hold after your edit, the fix is wrong — stop and re-check placement before proceeding to Step 2.

- [ ] **Step 2: Verify the fix with a real live-edit simulation**

This bug only manifests after `renderAll()` runs a *second* time — triggered in production by `js/app.js`'s own `window.addEventListener('storage', ...)` handler (search for `"16. ÉCOUTE DES MODIFICATIONS DU DASHBOARD"` — it re-renders when `e.key === 'portfolio_data'`). A real `storage` event never fires in the same tab that changed `localStorage` (that's a cross-tab-only browser behavior), so simulate it directly by dispatching a synthetic one — this is the exact code path production uses, not an approximation. `PORTFOLIO_DATA` is assigned without a `let`/`const`/`var` keyword at the top of the file (`PORTFOLIO_DATA = DEFAULT_PORTFOLIO_DATA;`), so it's a real global, reachable as `window.PORTFOLIO_DATA` from Playwright.

Serve the public site (`python -m http.server` from `Portofolio/`, or `node server.js` — either works, this test only needs `index.html` + `js/app.js`, no dashboard auth involved) and use Playwright:

1. Navigate to `index.html`. Do not scroll yet.
2. Via `browser_evaluate`, confirm the bug's precondition and the fix's target in one call:
   ```js
   () => {
       const revealEls = document.querySelectorAll('.reveal');
       return {
           revealCount: revealEls.length, // should be 5 (Hero, About, Skills, Projects, Contact section-inners, per Task 10 of the Carte Celeste plan)
           anyAlreadyActive: [...revealEls].some(el => el.classList.contains('active')),
       };
   }
   ```
   Expect `revealCount: 5`, and `anyAlreadyActive` may be `true` only for Hero if it's within the initial viewport — that's fine, not part of what this test checks.
3. Dispatch the synthetic live-edit event, mimicking exactly what the dashboard's save flow would send (same `PORTFOLIO_DATA`, unchanged content — this test only needs the re-render to *happen*, not to change any visible text):
   ```js
   () => {
       window.dispatchEvent(new StorageEvent('storage', {
           key: 'portfolio_data',
           newValue: JSON.stringify(window.PORTFOLIO_DATA),
       }));
   }
   ```
4. Via `browser_evaluate`, confirm the success toast rendered (`document.querySelector('.toast.success')` should exist, its `.toast-message` text should read "Portfolio mis à jour en temps réel !"). Via `browser_console_messages`, confirm 0 console errors (in particular, no `revealObserver is not defined` / `Cannot access 'revealObserver' before initialization` — the latter is exactly what Step 1's ordering mistake would have caused, so this check also guards against that regression).
5. Now scroll each of the About, Skills, Projects, and Contact sections into view one at a time (`element.scrollIntoView()` via `browser_evaluate`, or `browser_evaluate` reading `getComputedStyle(el).opacity` immediately after each scroll). Confirm each transitions to `opacity: 1` / gains the `.active` class. **This is the actual regression check**: with the bug present, `renderAll()`'s re-observe call was a no-op (silently skipped, `revealObserver` unreachable), so these elements would stay at `opacity: 0` forever after step 3's dispatch, even when scrolled into view. With the fix, `revealObserver` (declared early, assigned once, and stable across every `renderAll()` call) is the *same* observer instance throughout, so re-running `.observe()` on it after the dispatch works exactly as it did on first load.

- [ ] **Step 3: Commit**

```bash
git add js/app.js
git commit -m "fix: hoist revealObserver out of its if-block so renderAll() can re-observe elements after a live edit"
```

---

## Self-Review Notes

- **Spec coverage:** Spec point 1 → Task 1. Spec point 2 → Task 2. Spec point 3 → Task 3. Spec point 4 → Task 4. All four spec sections have a corresponding task; no spec requirement was left uncovered.
- **Type/name consistency:** `renderIcon(name, extraClass)`'s signature (from `js/icons.js`, unmodified by this plan) is called with one argument (`renderIcon(name)`) in Task 3, matching how the Carte Céleste plan's Task 5 called it (`extraClass` is optional). `--cc-*` token names are introduced once in Task 1 and referenced identically in Task 2 — no renamed or differently-spelled variant. `syncAboutPreview`/`syncContactPreview` names match their call sites in `fillAboutForm`/`fillContactForm`/`loadData` exactly.
- **Placeholder scan:** No task contains "TBD"/"add error handling"/"similar to Task N" — every step shows the literal before/after code or the literal shell command to run.
