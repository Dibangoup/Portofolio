# Security Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the 7 in-scope findings from the 2026-08-11 security audit of Portofolio (stored XSS, over-broad static file exposure, unvalidated `/api/save` payloads, unlimited auth attempts, CSRF-via-cached-Basic-Auth, missing security headers, vulnerable transitive dev dependencies).

**Architecture:** Two tasks harden the public site's rendering (`js/app.js`) against stored XSS by introducing shared escaping/URL-validation helpers and applying them everywhere `PORTFOLIO_DATA` reaches `innerHTML`. Five sequential tasks harden `server.js` (each adds one independent control: path blocking, payload validation, rate limiting, a CSRF header check, and dual Content-Security-Policy). A final task updates vulnerable dev dependencies.

**Tech Stack:** Vanilla JS (site), Express 4 (server), two new npm dependencies (`express-rate-limit`, `helmet`).

## Global Constraints

- `js/portfolio-data.js` — schema never changes shape.
- No existing `id` is renamed. One new `id` is introduced: `nav-logo-name` (a child of the existing, unchanged `#nav-logo`).
- No automated test suite exists for this project. Every task's verification step is a manual/Playwright check against the real rendered page, or a `curl`-based check against the real server.
- **Never click the dashboard's "Enregistrer" button, and never trigger a real POST to `/api/save`, during any verification step in this plan.** The dashboard's save button overwrites the real `js/portfolio-data.js` on disk. Every verification in this plan is read-only unless explicitly testing a rejection path (e.g. confirming a malformed payload gets a 400/403, which never reaches the file-write code).
- The dashboard is protected by real HTTP Basic Auth (`server.js`, credentials in `.env`). To test it during verification, read `DASHBOARD_USER`/`DASHBOARD_PASSWORD` directly from the local `.env` file and use them only within your own tool calls. **Never write the actual credential values into any file that gets committed or into any report** — this exact mistake happened repeatedly on a prior plan for this same project (quoted in prose, embedded in logged URLs) and cost multiple fix rounds each time. Reference credentials only as "read from `.env`".
- Tasks 3-7 all modify `server.js` sequentially. Each task's "find" text is an exact, stable anchor (a route-registration's opening line, or a clearly-delimited existing block) that does not change in content between tasks — only grows by one added token per task where noted. If a task's literal "find" text does not match what's actually in the file (because an earlier task in this plan hasn't landed yet, or landed differently), stop and report rather than guessing at a fix.

---

### Task 1: XSS — escaping/URL-validation helpers + hero section

**Files:**
- Modify: `js/app.js:26-30` (insert new helper functions after this range), `js/app.js:283-312` (`renderHero()`)
- Modify: `css/components.css:297-303` (append a new rule after `.nav-brand`)

**Interfaces:**
- Produces: `escapeHtml(str)` (returns an HTML-entity-escaped string) and `safeUrl(url)` (returns the URL unchanged if its scheme is `http:`/`https:`, or `#` otherwise) — both defined at the top of the `DOMContentLoaded` callback, both used by Task 2's render functions.

- [ ] **Step 1: Add the two shared helper functions**

In `js/app.js`, find:

```js
    // Déclaré ici (avant renderAll(), appelé plus bas) pour que renderAll() puisse le référencer
    // en toute sécurité dès le premier rendu — voir l'assignation réelle plus bas, §8 ANIMATIONS AU SCROLL.
    let revealObserver = null;
```

Replace with (adds two new function declarations immediately after):

```js
    // Déclaré ici (avant renderAll(), appelé plus bas) pour que renderAll() puisse le référencer
    // en toute sécurité dès le premier rendu — voir l'assignation réelle plus bas, §8 ANIMATIONS AU SCROLL.
    let revealObserver = null;

    // Échappe les caractères HTML spéciaux avant d'interpoler une donnée du dashboard
    // (PORTFOLIO_DATA) dans un template innerHTML — empêche l'injection de balises actives.
    const escapeHtml = (str) => String(str ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));

    // Ne laisse passer que les URLs http(s) pour les attributs href/src — bloque les
    // schémas dangereux (javascript:, data:, etc.) même si la chaîne est par ailleurs
    // correctement échappée côté HTML.
    // Une chaîne vide reste une chaîne vide (préserve le comportement "pas d'image" d'un
    // <img src=""> existant, qui ne déclenche aucune requête) — seul "#" (le sentinel
    // "pas de lien" déjà utilisé partout dans ce fichier) et les schémas dangereux sont
    // normalisés vers "#".
    const safeUrl = (url) => {
        if (!url) return '';
        if (url === '#') return '#';
        try {
            const parsed = new URL(url, window.location.origin);
            return (parsed.protocol === 'http:' || parsed.protocol === 'https:') ? url : '#';
        } catch {
            return '#';
        }
    };
```

- [ ] **Step 2: Fix the hero title and nav logo**

In `js/app.js`, find `renderHero()`:

```js
    const renderHero = () => {
        const h = PORTFOLIO_DATA.hero;
        if (!h) return;
        
        const availabilityEl = document.getElementById('hero-availability');
        if (availabilityEl) availabilityEl.textContent = h.availability || '';
        
        const titleEl = document.getElementById('hero-title');
        if (titleEl) titleEl.innerHTML = h.title || '';
        
        const descEl = document.getElementById('hero-description');
        if (descEl) descEl.textContent = h.description || '';
        
        const imgEl = document.getElementById('hero-img');
        if (imgEl) imgEl.src = h.image || '';
        
        const badge1El = document.getElementById('hero-badge-1');
        if (badge1El && h.badges) badge1El.textContent = h.badges[0] || '';
        
        const badge2El = document.getElementById('hero-badge-2');
        if (badge2El && h.badges) badge2El.textContent = h.badges[1] || '';
        
        const logoEl = document.getElementById('nav-logo');
        if (logoEl) {
            logoEl.innerHTML = `${h.name} Portfolio<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--accent);margin-left:4px;"></span>`;
        }
        
        // Mettre à jour aussi le titre du document
        document.title = `${h.name} Portfolio | Portfolio Étudiant`;
    };
```

Replace with:

```js
    const renderHero = () => {
        const h = PORTFOLIO_DATA.hero;
        if (!h) return;
        
        const availabilityEl = document.getElementById('hero-availability');
        if (availabilityEl) availabilityEl.textContent = h.availability || '';
        
        const titleEl = document.getElementById('hero-title');
        if (titleEl) titleEl.textContent = h.title || '';
        
        const descEl = document.getElementById('hero-description');
        if (descEl) descEl.textContent = h.description || '';
        
        const imgEl = document.getElementById('hero-img');
        if (imgEl) imgEl.src = safeUrl(h.image || '');
        
        const badge1El = document.getElementById('hero-badge-1');
        if (badge1El && h.badges) badge1El.textContent = h.badges[0] || '';
        
        const badge2El = document.getElementById('hero-badge-2');
        if (badge2El && h.badges) badge2El.textContent = h.badges[1] || '';
        
        const logoEl = document.getElementById('nav-logo');
        if (logoEl) {
            logoEl.textContent = '';
            const nameSpan = document.createElement('span');
            nameSpan.id = 'nav-logo-name';
            nameSpan.textContent = `${h.name} Portfolio`;
            const dot = document.createElement('span');
            dot.className = 'nav-logo-dot';
            logoEl.appendChild(nameSpan);
            logoEl.appendChild(dot);
        }
        
        // Mettre à jour aussi le titre du document
        document.title = `${h.name} Portfolio | Portfolio Étudiant`;
    };
```

(`h.title`'s support for embedded `<br>` line breaks is intentionally removed — confirmed with the user. `logoEl` now clears and rebuilds its two children via safe DOM APIs on every call, which also removes the only inline `style="..."` attribute the public site ever generated — needed for Task 7's strict Content-Security-Policy.)

- [ ] **Step 3: Add the `.nav-logo-dot` CSS rule**

In `css/components.css`, find:

```css
.nav-brand {
    font-size: 15px;
    font-weight: 700;
    color: var(--ink);
    text-decoration: none;
    white-space: nowrap;
}
```

Replace with (adds a new rule after, nothing else changes):

```css
.nav-brand {
    font-size: 15px;
    font-weight: 700;
    color: var(--ink);
    text-decoration: none;
    white-space: nowrap;
}
.nav-logo-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent);
    margin-left: 4px;
}
```

- [ ] **Step 4: Visual verification**

Serve the site locally (`python -m http.server` or `node server.js` from `Portofolio/`, no dashboard auth needed for this check) and use Playwright:
- Confirm the hero title still renders correctly (plain text, no `<br>` needed for the current data).
- Confirm the nav logo shows the name + "Portfolio" + a small gold dot, identical in appearance to before.
- Via `browser_evaluate`, confirm `document.getElementById('nav-logo').innerHTML` no longer contains a `style="` attribute, and confirm `document.getElementById('nav-logo-name')` exists with the expected text.
- Confirm 0 console errors.

- [ ] **Step 5: Commit**

```bash
git add js/app.js css/components.css
git commit -m "fix: add HTML-escaping/URL-validation helpers, remove innerHTML from hero rendering"
```

---

### Task 2: XSS — apply escaping across remaining render functions

**Files:**
- Modify: `js/app.js` — `openProjectModal()` (currently ~lines 228-263), `renderAbout()` (~314-357), `renderSkills()` (~359-387), `renderProjects()` (~389-413), `openCvModal()` (~497-559)

**Interfaces:**
- Consumes: `escapeHtml(str)` and `safeUrl(url)` from Task 1 — do not redefine them, they already exist in this file.

- [ ] **Step 1: `openProjectModal()`**

Find:

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

Replace with:

```js
    const openProjectModal = (projectId) => {
        const data = PROJECTS_DATA[projectId];
        if (!data || !projectModal || !projectModalContent) return;

        const techBadges = data.tech.map(t => `<span class="tech-pill">${escapeHtml(t)}</span>`).join('');

        const featuresList = data.features.map(f => `
            <li>${renderIcon('check')}<span>${escapeHtml(f)}</span></li>
        `).join('');

        const links = `
            ${data.demo !== '#' ? `<a href="${safeUrl(data.demo)}" target="_blank" rel="noopener" class="btn btn-primary">${renderIcon('link')} Voir la démo</a>` : ''}
            ${data.source !== '#' ? `<a href="${safeUrl(data.source)}" target="_blank" rel="noopener" class="btn btn-ghost">${renderIcon('code')} Code source</a>` : ''}
        `;

        projectModalContent.innerHTML = `
            <article class="article-sheet">
                <div class="article-image">
                    <img src="${safeUrl(data.image)}" alt="${escapeHtml(data.title)}">
                </div>
                <span class="stop-cat">${escapeHtml(data.categoryLabel)}</span>
                <h2 class="article-title">${escapeHtml(data.title)}</h2>
                <div class="tech-row">${techBadges}</div>
                <p class="article-desc">${escapeHtml(data.description)}</p>
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

- [ ] **Step 2: `renderAbout()`**

Find:

```js
        const paragraphsEl = document.getElementById('about-paragraphs');
        if (paragraphsEl && a.paragraphs) {
            paragraphsEl.innerHTML = a.paragraphs.map(p =>
                `<p class="flowing-text">${p}</p>`
            ).join('');
        }
```

Replace with:

```js
        const paragraphsEl = document.getElementById('about-paragraphs');
        if (paragraphsEl && a.paragraphs) {
            paragraphsEl.innerHTML = a.paragraphs.map(p =>
                `<p class="flowing-text">${escapeHtml(p)}</p>`
            ).join('');
        }
```

Find:

```js
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
```

Replace with:

```js
        const eduContainer = document.getElementById('about-education-container');
        if (eduContainer && a.education) {
            eduContainer.innerHTML = a.education.map(e => `
                <div class="tl-item">
                  <span class="tl-date mono">${escapeHtml(e.dates)}</span>
                  <div>
                    <div class="tl-title">${escapeHtml(e.degree)}</div>
                    <p class="tl-desc">${escapeHtml(e.school)}. ${escapeHtml(e.desc)}</p>
                  </div>
                </div>
            `).join('');
        }

        const valuesContainer = document.getElementById('about-values-container');
        if (valuesContainer && a.values) {
            valuesContainer.innerHTML = a.values.map(v => `
                <div class="value-card">
                  <span class="value-emoji muted-emoji">${escapeHtml(v.emoji || '★')}</span>
                  <div class="value-title">${escapeHtml(v.title)}</div>
                  <p class="value-desc">${escapeHtml(v.desc)}</p>
                </div>
            `).join('');
        }
```

(`journey1`/`journey2` in this same function already use `textContent` — do not touch those lines, they're already safe.)

- [ ] **Step 3: `renderSkills()`**

Find:

```js
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
```

Replace with:

```js
        container.innerHTML = PORTFOLIO_DATA.skills.map(cat => {
            const skillItemsHtml = cat.items.map(item => `
                <div class="skill-row">
                  <div class="skill-row-top">
                    <span>${escapeHtml(item.name)}</span>
                    <span class="skill-percent">${escapeHtml(String(item.percent))}%</span>
                  </div>
                  <div class="skill-fill-track">
                    <div class="skill-bar-fill" data-percent="${escapeHtml(String(item.percent))}"></div>
                  </div>
                </div>
            `).join('');

            return `
                <div class="skill-legend-col">
                  <h3>${renderIcon(iconFor(cat.icon))} ${escapeHtml(cat.category)}</h3>
                  ${skillItemsHtml}
                </div>
            `;
        }).join('');
```

(`item.percent` is normally a number, but is wrapped with `String(...)` before escaping since `escapeHtml` calls `.replace` on its input — passing a raw number would still work via the `String(str ?? '')` coercion inside `escapeHtml` itself, but making the `String()` explicit at the call site matches the pattern used for other non-string-typed fields in this task and avoids relying on the implicit coercion.)

- [ ] **Step 4: `renderProjects()`**

Find:

```js
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
              ${(proj.demo !== '#' || proj.source !== '#') ? `
              <div class="stop-links">
                ${proj.demo !== '#' ? `<a href="${proj.demo}" target="_blank" rel="noopener" class="external-link">${renderIcon('link')} Démo</a>` : ''}
                ${proj.source !== '#' ? `<a href="${proj.source}" target="_blank" rel="noopener" class="external-link">${renderIcon('code')} Code</a>` : ''}
              </div>
              ` : ''}
            </div>
          </article>
        `).join('');
```

Replace with:

```js
        grid.innerHTML = PORTFOLIO_DATA.projects.map(proj => `
          <article class="stop-card" data-category="${escapeHtml(proj.category)}" data-project-id="${escapeHtml(proj.id)}">
            <div class="stop-viewport">
              <img alt="${escapeHtml(proj.cardTitle)}" src="${safeUrl(proj.image)}" />
            </div>
            <div class="stop-body">
              <span class="stop-cat">${escapeHtml(proj.categoryLabel)}</span>
              <h3 class="project-title">${escapeHtml(proj.cardTitle)}</h3>
              <p>${escapeHtml(proj.shortDescription)}</p>
              <div class="tech-row">
                ${proj.tech.slice(0, 3).map(t => `<span class="tech-pill">${escapeHtml(t)}</span>`).join('')}
              </div>
              ${(proj.demo !== '#' || proj.source !== '#') ? `
              <div class="stop-links">
                ${proj.demo !== '#' ? `<a href="${safeUrl(proj.demo)}" target="_blank" rel="noopener" class="external-link">${renderIcon('link')} Démo</a>` : ''}
                ${proj.source !== '#' ? `<a href="${safeUrl(proj.source)}" target="_blank" rel="noopener" class="external-link">${renderIcon('code')} Code</a>` : ''}
              </div>
              ` : ''}
            </div>
          </article>
        `).join('');
```

- [ ] **Step 5: `openCvModal()`**

Find:

```js
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
```

Replace with:

```js
        const skillsBadges = cv.skills.map(s => `<span class="tech-pill">${escapeHtml(s)}</span>`).join('');
        const languagesList = cv.languages.map(l => `<li>${escapeHtml(l)}</li>`).join('');

        const experiencesList = cv.experiences.map(exp => `
            <div class="cv-entry">
                <div class="cv-entry-top">
                    <h5>${escapeHtml(exp.role)}</h5>
                    <span class="mono">${escapeHtml(exp.dates)}</span>
                </div>
                <span class="cv-entry-org">${escapeHtml(exp.company)}</span>
                <p>${escapeHtml(exp.description)}</p>
            </div>
        `).join('');

        const formationsList = cv.formations.map(f => `
            <div class="cv-entry">
                <div class="cv-entry-top">
                    <h5>${escapeHtml(f.degree)}</h5>
                    <span class="mono">${escapeHtml(f.dates)}</span>
                </div>
                <span class="cv-entry-org">${escapeHtml(f.school)}</span>
            </div>
        `).join('');

        cvModalContent.innerHTML = `
            <div class="cv-sheet">
                <div class="cv-header">
                    <div>
                        <h2>${escapeHtml(cv.identity.name)}</h2>
                        <p class="cv-role">${escapeHtml(cv.identity.role)}</p>
                        <p class="cv-availability">${escapeHtml(cv.identity.availability)}</p>
                    </div>
                    <button class="btn btn-primary" id="download-pdf-btn">${renderIcon('download')} Télécharger le CV PDF</button>
                </div>

                <div class="cv-grid">
                    <div class="cv-col">
                        <h4>Contact</h4>
                        <ul class="cv-contact-list">
                            <li>${renderIcon('mail')} ${escapeHtml(cv.contact.email)}</li>
                            <li>${renderIcon('phone')} ${escapeHtml(cv.contact.phone)}</li>
                            <li>${renderIcon('location')} ${escapeHtml(cv.contact.location)}</li>
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
```

- [ ] **Step 6: Verification**

Serve the site locally, use Playwright:
- Confirm About/Skills/Projects/CV modal/project modal all render exactly as before with the real (currently benign) data — no visual regression.
- Directly exercise the escaping: via `browser_evaluate`, temporarily set `PORTFOLIO_DATA.projects[0].shortDescription = '<img src=x onerror="window.__xssFired=true">'`, call `renderProjects()`, then check `window.__xssFired` is `undefined` (the payload rendered as inert text, not an executing image-error handler) AND that the visible text content of that project's description literally contains the `<img ...>` string. This directly proves the fix without needing to touch the dashboard or `/api/save`. Revert `PORTFOLIO_DATA` afterward (it's in-memory only, a page reload also discards it — nothing is persisted).
- Confirm 0 console errors (other than the deliberately-triggered check above, which should NOT produce an error — it should produce no effect at all).

- [ ] **Step 7: Commit**

```bash
git add js/app.js
git commit -m "fix: escape all PORTFOLIO_DATA interpolations across remaining render functions"
```

---

### Task 3: Block sensitive paths from static file serving

**Files:**
- Modify: `server.js` (add new middleware before `app.use(express.static(__dirname))`)

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing consumed by later tasks (independent control).

- [ ] **Step 1: Add the blocking middleware**

In `server.js`, find:

```js
// Servir les fichiers statiques du site (portfolio public + reste des assets du dashboard)
app.use(express.static(__dirname));
```

Replace with:

```js
// Empêche express.static de servir des fichiers internes au projet (code serveur,
// dépendances, documentation de planification) qui ne sont jamais destinés à être publics.
// .env lui-même est déjà bloqué par le comportement par défaut d'express.static pour les
// fichiers pointés (dotfiles) — ce middleware couvre les fichiers non pointés.
const BLOCKED_STATIC_PREFIXES = ['/server.js', '/package.json', '/package-lock.json', '/node_modules/', '/docs/', '/.superpowers/'];
app.use((req, res, next) => {
    if (BLOCKED_STATIC_PREFIXES.some(p => req.path === p || req.path.startsWith(p))) {
        return res.status(404).send('Not found');
    }
    next();
});

// Servir les fichiers statiques du site (portfolio public + reste des assets du dashboard)
app.use(express.static(__dirname));
```

- [ ] **Step 2: Verification**

Start the server (`node server.js`), then via `curl`:
- `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/server.js` — expect `404` (was `200` before this fix).
- `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/package.json` — expect `404`.
- `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/docs/superpowers/plans/2026-08-11-security-hardening.md` — expect `404`.
- `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/node_modules/express/package.json` — expect `404`.
- `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/index.html` — expect `200` (public site still works).
- `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/js/app.js` — expect `200` (public assets still served).
- `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/css/tailwind-build.css` — expect `200`.

Stop the server when done.

- [ ] **Step 3: Commit**

```bash
git add server.js
git commit -m "fix: block internal project files from being served as static assets"
```

---

### Task 4: Validate and sanitize `/api/save` payloads

**Files:**
- Modify: `server.js` — add helper declarations near `safeEqual`, modify the body of `app.post('/api/save', ...)`

**Interfaces:**
- Produces: `stripDangerousKeys(value)`, `ALLOWED_TOP_LEVEL_KEYS` — used only within this task's own route handler, not consumed elsewhere.

- [ ] **Step 1: Add the validation helpers**

In `server.js`, find:

```js
// Comparaison à temps constant : on hash les deux valeurs avant de les comparer
// pour éviter que crypto.timingSafeEqual() ne lève une erreur en cas de longueurs
// différentes, tout en gardant une comparaison insensible au temps d'exécution.
function safeEqual(a, b) {
  const hashA = crypto.createHash('sha256').update(String(a)).digest();
  const hashB = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}
```

Replace with (adds two new declarations after `safeEqual`):

```js
// Comparaison à temps constant : on hash les deux valeurs avant de les comparer
// pour éviter que crypto.timingSafeEqual() ne lève une erreur en cas de longueurs
// différentes, tout en gardant une comparaison insensible au temps d'exécution.
function safeEqual(a, b) {
  const hashA = crypto.createHash('sha256').update(String(a)).digest();
  const hashB = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

// Le fichier généré par /api/save est chargé par le navigateur comme du VRAI JavaScript
// (const DEFAULT_PORTFOLIO_DATA = {...};), pas via JSON.parse — une clé "__proto__" dans
// le payload aurait donc un effet réel sur le prototype de l'objet une fois interprétée
// par le navigateur. On la retire par précaution, à tous les niveaux d'imbrication.
const DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype'];
function stripDangerousKeys(value) {
  if (Array.isArray(value)) return value.map(stripDangerousKeys);
  if (value && typeof value === 'object') {
    const clean = {};
    for (const key of Object.keys(value)) {
      if (DANGEROUS_KEYS.includes(key)) continue;
      clean[key] = stripDangerousKeys(value[key]);
    }
    return clean;
  }
  return value;
}

// Les seules clés de premier niveau que js/portfolio-data.js est censé contenir.
const ALLOWED_TOP_LEVEL_KEYS = ['hero', 'about', 'skills', 'projects', 'cv', 'contact'];
```

- [ ] **Step 2: Use the helpers in the `/api/save` handler**

In `server.js`, find:

```js
app.post('/api/save', requireDashboardAuth, (req, res) => {
  const portfolioData = req.body;
  if (!portfolioData) {
    return res.status(400).json({ error: 'Données manquantes' });
  }

  // Formatage en fichier JavaScript
  const fileContent = `// BASE DE DONNÉES DU PORTFOLIO - CENTRALISÉE ET MODIFIABLE EN TEMPS RÉEL
const DEFAULT_PORTFOLIO_DATA = ${JSON.stringify(portfolioData, null, 2)};

// Variable globale pour stocker les données chargées en mémoire
var PORTFOLIO_DATA = DEFAULT_PORTFOLIO_DATA;
`;
```

Replace with:

```js
app.post('/api/save', requireDashboardAuth, (req, res) => {
  const portfolioData = req.body;
  if (!portfolioData) {
    return res.status(400).json({ error: 'Données manquantes' });
  }

  const unexpectedKeys = Object.keys(portfolioData).filter(k => !ALLOWED_TOP_LEVEL_KEYS.includes(k));
  if (unexpectedKeys.length > 0) {
    return res.status(400).json({ error: `Clés inattendues : ${unexpectedKeys.join(', ')}` });
  }
  const cleanData = stripDangerousKeys(portfolioData);

  // Formatage en fichier JavaScript
  const fileContent = `// BASE DE DONNÉES DU PORTFOLIO - CENTRALISÉE ET MODIFIABLE EN TEMPS RÉEL
const DEFAULT_PORTFOLIO_DATA = ${JSON.stringify(cleanData, null, 2)};

// Variable globale pour stocker les données chargées en mémoire
var PORTFOLIO_DATA = DEFAULT_PORTFOLIO_DATA;
`;
```

(Everything after this point in the handler — `fs.writeFile(targetPath, fileContent, ...)` — is unchanged; it already writes `fileContent`, which now derives from `cleanData` instead of the raw `portfolioData`.)

- [ ] **Step 3: Verification**

Start the server, then via `curl` (reading the real credentials from `.env` for the `-u` flag, never writing them into any file):
- Send a POST with an unexpected top-level key and valid auth: `curl -s -o /dev/null -w "%{http_code}\n" -u "$DASHBOARD_USER:$DASHBOARD_PASSWORD" -X POST -H "Content-Type: application/json" -d '{"notAField":true}' http://localhost:3000/api/save` — expect `400`. **This never reaches the file-write step, so it's safe to actually run** (the handler returns before touching `fs.writeFile`).
- Do NOT send a request with valid top-level keys (`hero`, `about`, etc.) — that would reach the real file-write step and overwrite `js/portfolio-data.js`, which is exactly what this plan's Global Constraints forbid. Verify the `stripDangerousKeys` logic directly instead, with the server stopped, by running exactly this command from `Portofolio/`:

```bash
node -e "
const DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype'];
function stripDangerousKeys(value) {
  if (Array.isArray(value)) return value.map(stripDangerousKeys);
  if (value && typeof value === 'object') {
    const clean = {};
    for (const key of Object.keys(value)) {
      if (DANGEROUS_KEYS.includes(key)) continue;
      clean[key] = stripDangerousKeys(value[key]);
    }
    return clean;
  }
  return value;
}
const input = JSON.parse('{\"a\":1,\"__proto__\":{\"polluted\":true},\"nested\":{\"constructor\":\"x\",\"b\":2}}');
const result = stripDangerousKeys(input);
console.log(JSON.stringify(result));
console.log('has own __proto__ key:', Object.prototype.hasOwnProperty.call(result, '__proto__'));
console.log('nested has own constructor key:', Object.prototype.hasOwnProperty.call(result.nested, 'constructor'));
console.log('a survived:', result.a === 1);
console.log('nested.b survived:', result.nested.b === 2);
"
```

Expected output: the JSON line shows `nested` containing only `b`, no `polluted`/`constructor` anywhere; both `hasOwnProperty` checks print `false`; both survival checks print `true`. (`JSON.parse` is used to build `input` specifically so that `__proto__` in the source literal becomes a real own-enumerable property of the parsed object — as it would from `express.json()` parsing a real request body — rather than triggering object-literal prototype-setting syntax, which is what a `{__proto__: ...}` object literal would do instead and would defeat the point of this test.)

- [ ] **Step 4: Commit**

```bash
git add server.js
git commit -m "fix: validate /api/save payload shape and strip dangerous keys before writing to disk"
```

---

### Task 5: Rate-limit authentication attempts

**Files:**
- Modify: `package.json` (new dependency), `server.js` (require + limiter definition + apply to both protected routes)

**Interfaces:**
- Produces: `authLimiter` middleware, applied to the `/dashboard.html` and `/api/save` route registrations.

- [ ] **Step 1: Add the dependency**

```bash
npm install express-rate-limit
```

Verify: `package.json`'s `dependencies` now includes `"express-rate-limit"`.

- [ ] **Step 2: Define the limiter**

In `server.js`, find:

```js
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
```

Replace with:

```js
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
```

Find:

```js
// Middleware pour parser le JSON
app.use(express.json({ limit: '10mb' }));
```

Replace with (adds the limiter definition after, nothing else changes):

```js
// Middleware pour parser le JSON
app.use(express.json({ limit: '10mb' }));

// Limite les tentatives d'authentification pour rendre le brute-force du mot de passe
// du dashboard impraticable, sans gêner un usage légitime (un seul admin).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Trop de tentatives, réessayez plus tard.',
});
```

- [ ] **Step 3: Apply the limiter to both protected routes**

Find:

```js
app.get('/dashboard.html', requireDashboardAuth, (req, res) => {
```

Replace with:

```js
app.get('/dashboard.html', authLimiter, requireDashboardAuth, (req, res) => {
```

Find:

```js
app.post('/api/save', requireDashboardAuth, (req, res) => {
```

Replace with:

```js
app.post('/api/save', authLimiter, requireDashboardAuth, (req, res) => {
```

(These are single-line changes to the route registrations only — do not touch anything inside either route's body, which Task 4 already modified.)

- [ ] **Step 4: Verification**

Start the server, then via `curl` (without valid credentials, so no risk of reaching the real file-write logic even for `/api/save`):
- Send 21 rapid unauthenticated requests to `/dashboard.html` in a loop and confirm the 21st returns `429` instead of `401`: `for i in $(seq 1 21); do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/dashboard.html; done` — expect the first 20 lines to show `401` (no credentials provided) and the 21st to show `429`.
- Confirm a single legitimate request still works normally (start a fresh server process to reset the rate-limit window, then one authenticated request should succeed as before).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json server.js
git commit -m "feat: rate-limit dashboard authentication attempts"
```

---

### Task 6: CSRF mitigation on `/api/save`

**Files:**
- Modify: `server.js` (new middleware, applied to `/api/save` only), `dashboard.html` (add the required header to the existing save fetch call)

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Add the header-check middleware**

In `server.js`, find:

```js
if (!DASHBOARD_PASSWORD) {
  console.warn(
    '\n⚠️  DASHBOARD_PASSWORD non défini : /dashboard.html et /api/save resteront ' +
    'inaccessibles (503) tant que .env n\'est pas configuré. Copiez .env.example en .env ' +
    'et définissez un mot de passe.\n'
  );
}
```

Replace with (adds a new function after, nothing else changes):

```js
if (!DASHBOARD_PASSWORD) {
  console.warn(
    '\n⚠️  DASHBOARD_PASSWORD non défini : /dashboard.html et /api/save resteront ' +
    'inaccessibles (503) tant que .env n\'est pas configuré. Copiez .env.example en .env ' +
    'et définissez un mot de passe.\n'
  );
}

// Un navigateur réattache automatiquement les identifiants Basic Auth mis en cache à
// toute requête vers la même origine, même déclenchée par une page tierce (CSRF). Ce
// header personnalisé ne peut pas être posé par un <form> ou un lien cross-site ; seul
// du JavaScript same-origin le peut, sans déclencher de blocage CORS puisqu'aucune
// configuration CORS n'autorise ce header en cross-origin.
function requireCustomHeader(req, res, next) {
  if (req.get('X-Dashboard-Request') !== '1') {
    return res.status(403).json({ error: 'Requête refusée (en-tête manquant).' });
  }
  next();
}
```

- [ ] **Step 2: Apply it to `/api/save` only**

Find (this is the post-Task-5 state — confirm this exact text is present before editing; if `authLimiter` isn't there yet, Task 5 hasn't landed and you should stop and report):

```js
app.post('/api/save', authLimiter, requireDashboardAuth, (req, res) => {
```

Replace with:

```js
app.post('/api/save', authLimiter, requireDashboardAuth, requireCustomHeader, (req, res) => {
```

Do NOT apply `requireCustomHeader` to `/dashboard.html` — it's a simple page `GET`, not a state-changing action, and doesn't need this check.

- [ ] **Step 3: Update the dashboard's client-side save call**

In `dashboard.html`, find:

```js
      async function saveToServer() {
        try {
          const response = await fetch('/api/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(PORTFOLIO_DATA)
          });
```

Replace with:

```js
      async function saveToServer() {
        try {
          const response = await fetch('/api/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Dashboard-Request': '1'
            },
            body: JSON.stringify(PORTFOLIO_DATA)
          });
```

- [ ] **Step 4: Verification**

Start the server, then via `curl` (no valid auth, so no risk of reaching the file-write step):
- `curl -s -o /dev/null -w "%{http_code}\n" -X POST -H "Content-Type: application/json" -d '{}' http://localhost:3000/api/save` — expect `401` (auth still checked first — `requireDashboardAuth` runs before `requireCustomHeader` in the chain, so an unauthenticated request never reaches the header check).
- To specifically test the header check in isolation, temporarily verify the middleware ordering by reading the code rather than sending a real authenticated request (sending one with a valid body and no custom header WOULD reach `requireCustomHeader` and get rejected with `403` before the file write — that part is safe to test live if you want extra confidence, using a body that would fail Task 4's key-validation anyway, e.g. `-d '{"bogus":true}'`, so even a bug in this task's ordering can't cascade into a real file write): `curl -s -o /dev/null -w "%{http_code}\n" -u "$DASHBOARD_USER:$DASHBOARD_PASSWORD" -X POST -H "Content-Type: application/json" -d '{"bogus":true}' http://localhost:3000/api/save` — expect `403` (correct auth, but missing `X-Dashboard-Request` header).
- Then repeat with the header present: add `-H "X-Dashboard-Request: 1"` to the same command — expect `400` now (header check passes, but `{"bogus":true}` fails Task 4's `ALLOWED_TOP_LEVEL_KEYS` check before ever reaching the file write) — this confirms `requireCustomHeader` correctly lets a properly-headed request through to the next check, without ever risking a real save.

- [ ] **Step 5: Commit**

```bash
git add server.js dashboard.html
git commit -m "fix: require a custom header on /api/save to mitigate CSRF via cached Basic Auth"
```

---

### Task 7: Security headers (helmet) with a dual Content-Security-Policy

**Files:**
- Modify: `package.json` (new dependency), `server.js` (require + two CSP configs + apply)

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Add the dependency**

```bash
npm install helmet
```

Verify: `package.json`'s `dependencies` now includes `"helmet"`.

- [ ] **Step 2: Require it and define both policies**

In `server.js`, find:

```js
const rateLimit = require('express-rate-limit');
```

Replace with:

```js
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
```

Find:

```js
// Limite les tentatives d'authentification pour rendre le brute-force du mot de passe
// du dashboard impraticable, sans gêner un usage légitime (un seul admin).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Trop de tentatives, réessayez plus tard.',
});
```

Replace with (adds the two CSP configs and the global helmet application after, nothing else changes):

```js
// Limite les tentatives d'authentification pour rendre le brute-force du mot de passe
// du dashboard impraticable, sans gêner un usage légitime (un seul admin).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Trop de tentatives, réessayez plus tard.',
});

// Deux Content-Security-Policy distinctes : le site public n'a aucun script/style inline
// et peut donc être strict (défense réelle contre une XSS qui passerait malgré tout à
// travers l'échappement) ; le dashboard a un unique <script> inline de tout son code
// (~1300 lignes) et charge des polices Google Fonts, donc reste permissif pour continuer
// à fonctionner — il est déjà protégé par l'authentification HTTP Basic.
const strictCsp = helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'"],
    fontSrc: ["'self'"],
    // 'https:' (pas une allowlist d'hôtes précis) car le dashboard permet de définir une
    // image de projet/portrait par URL externe (pas seulement par upload) — voir son champ
    // "Lien URL". Toujours plus strict que l'absence de CSP : bloque tout schéma non-https
    // (javascript:, etc.), juste pas restreint à un hébergeur d'images précis.
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'", 'https://api.web3forms.com'],
    formAction: ["'self'", 'https://api.web3forms.com'],
    frameAncestors: ["'none'"],
  },
});

const dashboardCsp = helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    imgSrc: ["'self'", 'data:'],
    connectSrc: ["'self'"],
    frameAncestors: ["'none'"],
  },
});

// En-têtes non liés au CSP (X-Content-Type-Options, X-Frame-Options, etc.) partout ;
// le CSP lui-même est géré séparément ci-dessous pour pouvoir varier par route.
app.use(helmet({ contentSecurityPolicy: false }));
// Politique stricte par défaut sur toutes les routes ; la route /dashboard.html (définie
// plus bas) applique dashboardCsp après ce middleware, ce qui REMPLACE l'en-tête déjà posé
// (les en-têtes HTTP ne sont envoyés qu'à l'appel de res.sendFile()/res.send(), donc c'est
// la dernière valeur posée avant l'envoi qui compte — pas besoin de middleware conditionnel).
app.use(strictCsp);
```

- [ ] **Step 3: Apply `dashboardCsp` to the dashboard route**

Find (this is the post-Task-5/Task-6 state — confirm this exact text is present; if `authLimiter, requireDashboardAuth` isn't there yet, an earlier task hasn't landed and you should stop and report):

```js
app.get('/dashboard.html', authLimiter, requireDashboardAuth, (req, res) => {
```

Replace with:

```js
app.get('/dashboard.html', authLimiter, requireDashboardAuth, dashboardCsp, (req, res) => {
```

- [ ] **Step 4: Verification**

Start the server, then via `curl -I` (headers only, no auth needed for this check on `/`):
- `curl -s -I http://localhost:3000/ | grep -i content-security-policy` — expect a line containing `default-src 'self'` and NOT containing `unsafe-inline`.
- `curl -s -I -u "$DASHBOARD_USER:$DASHBOARD_PASSWORD" http://localhost:3000/dashboard.html | grep -i content-security-policy` — expect a line containing `unsafe-inline` and `fonts.googleapis.com`.
- Via Playwright: navigate to the public site, confirm 0 console errors (would show CSP violation errors if the policy were too strict for what the page actually loads). Navigate to the dashboard (with auth), confirm it still loads and functions normally (switch tabs, open a modal, etc.) with 0 console errors.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json server.js
git commit -m "feat: add helmet security headers with a strict CSP on the public site and a permissive one on the dashboard"
```

---

### Task 8: Update vulnerable dev dependencies

**Files:**
- Modify: `package.json`, `package-lock.json` (via `npm audit fix`)

**Interfaces:**
- Consumes: nothing.
- Produces: nothing.

- [ ] **Step 1: Run the audit fix**

```bash
npm audit fix
```

- [ ] **Step 2: Verify the fix and that the build chain still works**

```bash
npm audit
```

Expected: 0 vulnerabilities (or confirm any remaining ones are genuinely unfixable without a breaking major-version bump — if `npm audit fix` reports it left something unresolved, read its output and report what remains rather than forcing `--force`, which can introduce breaking changes to unrelated tooling).

```bash
npm run build:css
```

Expected: completes without error, and `git diff --stat css/tailwind-build.css` shows either no change or a purely cosmetic one (confirms the Tailwind build chain — the actual consumer of the updated `nanoid`/`postcss` — still works correctly after the dependency bump).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: npm audit fix for nanoid/postcss transitive dev dependencies"
```

(If Step 2 regenerated `css/tailwind-build.css` with real content differences, also `git add css/tailwind-build.css` in this commit.)

---

## Self-Review Notes

- **Spec coverage:** Spec §1 (XSS) → Tasks 1-2. Spec §2 (static exposure) → Task 3. Spec §3 (`/api/save` validation) → Task 4. Spec §4 (rate limiting) → Task 5. Spec §5 (CSRF) → Task 6. Spec §6 (security headers) → Task 7. Spec §7 (`npm audit fix`) → Task 8. All 7 in-scope spec sections have a corresponding task.
- **Type/name consistency:** `escapeHtml`/`safeUrl` (Task 1) are called with the exact same names and signatures in every Task 2 call site. `authLimiter` (Task 5) is referenced by the same name in Task 7's route-registration edit. `requireDashboardAuth` (pre-existing, untouched) keeps its exact name and position (first auth-relevant middleware) in every route-registration edit across Tasks 5-7. `ALLOWED_TOP_LEVEL_KEYS`/`stripDangerousKeys` (Task 4) are self-contained to that task, not referenced elsewhere — correctly scoped.
- **Sequential same-file editing:** Tasks 3-7 all modify `server.js`. Each task's "find" text for the two route registrations grows by exactly one token per task, in a fixed order (`authLimiter` added by Task 5, then `requireCustomHeader` by Task 6 for `/api/save`, then `dashboardCsp` by Task 7 for `/dashboard.html`) — traced through by hand while writing this plan to confirm every task's literal "find" text matches what the immediately-prior task actually produces. Each task also explicitly instructs the implementer to stop and report if the expected anchor text isn't found, rather than guessing.
- **Placeholder scan:** No task contains "TBD"/"add error handling"/"similar to Task N" — every step shows the literal before/after code or the literal shell command to run.
