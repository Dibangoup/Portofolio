/* ==========================================================================
   OS.JS - "JORDANOS" : BUREAU + ÉDITEUR DE CODE + TERMINAL
   ==========================================================================
   Amélioration progressive de l'accueil (#hero) : son vrai contenu (mêmes id,
   donc app.js continue de le mettre à jour) est rangé dans des fenêtres :
     - Éditeur : explorateur (un fichier par section), onglets bienvenue.md /
       jordan.ts (objet tapé avec coloration syntaxique), barre d'état ;
     - Terminal : séquence d'ouverture tapée, puis commandes (help, open, code,
       projets, cv…) avec historique et complétion ;
     - photo.jpg, explorateur de projets ; icônes, barre des tâches, menu,
       horloge ; palette de commandes globale (Ctrl+K).
   Les sections suivantes reçoivent des numéros de ligne et une invite tapée.

   Aucune dépendance : animations via l'API Web Animations. Aucun style ni
   script inline (CSP stricte) : seul le CSSOM (element.style) est utilisé.
   Écoute "portfolio:lang" et "portfolio:rendered" émis par app.js.
*/
document.addEventListener('DOMContentLoaded', () => {
    const hero = document.getElementById('hero');
    if (!hero || typeof renderIcon !== 'function') return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const data = () => window.PORTFOLIO_DATA || {};
    const $ = (s, r = document) => r.querySelector(s);
    const el = (tag, cls, html) => {
        const e = document.createElement(tag);
        if (cls) e.className = cls;
        if (html != null) e.innerHTML = html;
        return e;
    };
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const isDesk = () => window.innerWidth > 860;
    const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    const openCv = () => document.getElementById('cv-btn')?.click();
    const openCase = (id) => document.querySelector(`.project[data-project-id="${CSS.escape(id)}"] .project-open`)?.click();
    const slug = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const animate = (node, frames, opts) => (reduced || !node.animate ? null : node.animate(frames, { easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'none', ...opts }));

    /* ======================================================================
       1. TEXTES (FR / EN)
       ====================================================================== */
    const I18N = {
        fr: {
            editor: 'Éditeur', terminal: 'Terminal', projects: 'Projets', explorer: 'Explorateur', journey: 'Parcours', contact: 'Contact',
            minimize: 'Réduire', close: 'Fermer', icons: 'Icônes du bureau', start: 'Menu Démarrer', search: 'Rechercher…',
            palette: 'Palette de commandes', paletteHint: 'Tapez une commande, une section ou un projet…', noMatch: 'Aucune commande ne correspond.',
            explorerTitle: 'EXPLORATEUR', explorerLabel: 'Explorateur de fichiers', boot: 'cliquez pour passer',
            bootLines: ['[ ok ] montage de /projets', '[ ok ] chargement de jordan.ts', '[ ok ] démarrage du terminal', 'JordanOS prêt.'],
            termInput: 'Commande du terminal (tapez help pour la liste)', termHint: 'Tapez « help » pour voir les commandes. Ctrl+K ouvre la palette.',
            openingCode: "→ ouverture de jordan.ts dans l'éditeur", opened: (x) => `→ ${x} ouvert`, notFound: (c) => `commande introuvable : ${c}. Tapez « help ».`,
            denied: 'Permission refusée. Il faut d’abord me recruter ;)', usageOpen: 'usage : open editeur | photo | projets | terminal',
            openingCv: 'Ouverture de cv.pdf…', langSwitched: 'Langue basculée.', goTo: (x) => `→ cd ~/${x}`,
            actOpenEditor: "Ouvrir l'éditeur", actOpenTerminal: 'Ouvrir le terminal', actShowCode: 'Afficher jordan.ts', actOpenProjects: 'Ouvrir projets/',
            actCase: (x) => `Étude de cas : ${x}`, actGo: (x) => `Aller à : ${x}`, actCv: 'Ouvrir le CV', actCopy: "Copier l'adresse e-mail", actLang: 'Changer de langue (FR / EN)',
            about: 'À propos', skills: 'Compétences', app: 'application', file: 'fichier', project: 'projet', copied: 'Adresse copiée.',
            ready: 'prêt à rejoindre votre équipe', contactFn: 'contacter', nf: ['Rôle   ', 'École  ', 'Statut ']
        },
        en: {
            editor: 'Editor', terminal: 'Terminal', projects: 'Projects', explorer: 'Explorer', journey: 'Journey', contact: 'Contact',
            minimize: 'Minimize', close: 'Close', icons: 'Desktop icons', start: 'Start menu', search: 'Search…',
            palette: 'Command palette', paletteHint: 'Type a command, a section or a project…', noMatch: 'No matching command.',
            explorerTitle: 'EXPLORER', explorerLabel: 'File explorer', boot: 'click to skip',
            bootLines: ['[ ok ] mounting /projects', '[ ok ] loading jordan.ts', '[ ok ] starting terminal', 'JordanOS ready.'],
            termInput: 'Terminal command (type help for the list)', termHint: 'Type "help" to list commands. Ctrl+K opens the palette.',
            openingCode: '→ opening jordan.ts in the editor', opened: (x) => `→ ${x} opened`, notFound: (c) => `command not found: ${c}. Type "help".`,
            denied: 'Permission denied. You need to hire me first ;)', usageOpen: 'usage: open editor | photo | projects | terminal',
            openingCv: 'Opening cv.pdf…', langSwitched: 'Language switched.', goTo: (x) => `→ cd ~/${x}`,
            actOpenEditor: 'Open the editor', actOpenTerminal: 'Open the terminal', actShowCode: 'Show jordan.ts', actOpenProjects: 'Open projects/',
            actCase: (x) => `Case study: ${x}`, actGo: (x) => `Go to: ${x}`, actCv: 'Open the resume', actCopy: 'Copy email address', actLang: 'Switch language (FR / EN)',
            about: 'About', skills: 'Skills', app: 'app', file: 'file', project: 'project', copied: 'Address copied.',
            ready: 'ready to join your team', contactFn: 'contact', nf: ['Role   ', 'School ', 'Status ']
        }
    };
    const L = () => I18N[document.documentElement.lang === 'en' ? 'en' : 'fr'];
    // Éléments dont le texte / l'aria-label suivent la langue : { node, key, attr }
    const localized = [];
    const bindText = (node, key, attr) => { localized.push({ node, key, attr }); applyOne({ node, key, attr }); return node; };
    function applyOne({ node, key, attr }) {
        const v = L()[key];
        if (attr) node.setAttribute(attr, v); else node.textContent = v;
    }

    /* ======================================================================
       2. ÉCRAN DE DÉMARRAGE (une fois par session, passable)
       ====================================================================== */
    let showBoot = false;
    try { showBoot = !reduced && !sessionStorage.getItem('jordanos_boot'); sessionStorage.setItem('jordanos_boot', '1'); } catch { /* stockage indisponible */ }
    if (showBoot) {
        const boot = el('div', 'os-boot', '<div class="os-boot-mark" aria-hidden="true">JD</div><div class="os-boot-log" aria-hidden="true"></div><small></small>');
        $('small', boot).textContent = L().boot;
        document.body.append(boot);
        let done = false;
        const end = () => {
            if (done) return;
            done = true;
            const a = animate(boot, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 });
            a ? a.finished.then(() => boot.remove()) : boot.remove();
            window.removeEventListener('keydown', end);
        };
        boot.addEventListener('click', end);
        window.addEventListener('keydown', end);
        (async () => {
            for (const line of L().bootLines) {
                if (done) return;
                const d = el('div', line.startsWith('[') ? '' : 'ok');
                d.textContent = line;
                $('.os-boot-log', boot).append(d);
                await sleep(230);
            }
            await sleep(200);
            end();
        })();
    }

    /* ======================================================================
       3. BUREAU ET GESTIONNAIRE DE FENÊTRES
       ====================================================================== */
    hero.classList.add('is-desktop');
    const desk = el('div', 'os-desktop');
    hero.append(desk);

    let z = 10;
    const wins = {};
    // Boutons de la barre des tâches : créés une fois par fenêtre puis seulement mis à jour
    // (les recréer ferait perdre le focus clavier et fausserait l'animation d'ouverture)
    const tasks = el('div', 'os-tasks');
    function makeWindow(id, titleKey, ic, content, { hidden = false, dark = false, title } = {}) {
        const w = el('section', `os-win${dark ? ' is-dark' : ''}`);
        w.dataset.win = id;
        w.innerHTML = `<div class="os-bar">${renderIcon(ic)}<span class="os-title"></span><div class="os-ctrls"><button type="button" data-act="min">${renderIcon('minus')}</button><button type="button" data-act="close">${renderIcon('close')}</button></div></div><div class="os-body"></div>`;
        const titleEl = $('.os-title', w);
        if (title) titleEl.textContent = title; else bindText(titleEl, titleKey);
        bindText($('[data-act="min"]', w), 'minimize', 'aria-label');
        bindText($('[data-act="close"]', w), 'close', 'aria-label');
        w.setAttribute('aria-labelledby', (titleEl.id = `os-title-${id}`));
        $('.os-body', w).append(...[].concat(content));
        w.hidden = hidden;
        desk.append(w);
        const task = el('button', 'os-task', `${renderIcon(ic)}<span></span>`);
        task.type = 'button';
        task.dataset.id = id;
        // Une fenêtre en cours de fermeture compte comme fermée : le clic la rouvre
        task.addEventListener('click', () => ((w.hidden || wins[id].closing) ? openWin(id, task) : (w.classList.contains('is-focused') ? closeWin(id, true) : focusWin(id))));
        tasks.append(task);
        wins[id] = { w, ic, titleEl, task, closing: null };
        w.addEventListener('pointerdown', () => focusWin(id));
        w.addEventListener('focusin', () => focusWin(id));
        enableDrag(w);
        $('[data-act="close"]', w).addEventListener('click', () => closeWin(id));
        $('[data-act="min"]', w).addEventListener('click', () => closeWin(id, true));
        return w;
    }
    function focusWin(id) {
        const { w } = wins[id];
        if (w.classList.contains('is-focused')) return;
        Object.values(wins).forEach((x) => x.w.classList.remove('is-focused'));
        w.style.zIndex = String(++z);
        w.classList.add('is-focused');
        renderTasks();
    }
    function openWin(id, from) {
        const win = wins[id];
        const { w } = win;
        // Réouverture pendant l'animation de fermeture : on l'annule
        if (win.closing) { win.closing.cancel(); win.closing = null; }
        const wasHidden = w.hidden;
        w.hidden = false;
        focusWin(id);
        if (wasHidden) {
            const r = w.getBoundingClientRect();
            const f = from?.getBoundingClientRect();
            const dx = f ? f.left + f.width / 2 - (r.left + r.width / 2) : 0;
            const dy = f ? f.top + f.height / 2 - (r.top + r.height / 2) : 20;
            animate(w, [{ opacity: 0, transform: `translate(${dx}px, ${dy}px) scale(0.85)` }, { opacity: 1, transform: 'none' }], { duration: 420 });
        }
        renderTasks();
    }
    function closeWin(id, toTask = false) {
        const win = wins[id];
        const { w, task } = win;
        if (w.hidden || win.closing) return;
        const hadFocus = w.contains(document.activeElement);
        const finish = () => {
            win.closing = null;
            w.hidden = true;
            renderTasks();
            // Le focus ne doit pas retomber sur <body> : on le rend au bouton de la fenêtre
            if (hadFocus) task.focus({ preventScroll: true });
        };
        const t = toTask ? task : null;
        const r = w.getBoundingClientRect();
        const tr = t?.getBoundingClientRect();
        const dx = tr ? tr.left + tr.width / 2 - (r.left + r.width / 2) : 0;
        const dy = tr ? tr.top - (r.top + r.height / 2) : 10;
        const a = animate(w, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translate(${dx}px, ${dy}px) scale(${toTask ? 0.2 : 0.9})` }], { duration: 300, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' });
        if (!a) return finish();
        win.closing = a;
        a.finished.then(finish, () => { /* annulée par une réouverture */ });
    }
    // Déplacement par la barre de titre (ordinateur uniquement), borné au bureau
    function enableDrag(w) {
        const bar = $('.os-bar', w);
        bar.addEventListener('pointerdown', (e) => {
            if (!isDesk() || e.button !== 0 || e.target.closest('button')) return;
            const d = desk.getBoundingClientRect();
            const r = w.getBoundingClientRect();
            const ox = e.clientX - r.left;
            const oy = e.clientY - r.top;
            bar.setPointerCapture(e.pointerId);
            const move = (ev) => {
                w.dataset.moved = '1';
                const x = Math.max(0, Math.min(d.width - r.width, ev.clientX - d.left - ox));
                const y = Math.max(0, Math.min(d.height - 36, ev.clientY - d.top - oy));
                Object.assign(w.style, { left: `${x}px`, top: `${y}px`, right: 'auto', bottom: 'auto' });
            };
            const up = () => { bar.removeEventListener('pointermove', move); bar.removeEventListener('pointerup', up); bar.removeEventListener('pointercancel', up); };
            bar.addEventListener('pointermove', move);
            bar.addEventListener('pointerup', up);
            bar.addEventListener('pointercancel', up);
        });
    }
    // Repasser en mobile annule les positions choisies à la souris
    window.matchMedia('(max-width: 860px)').addEventListener('change', (m) => {
        if (m.matches) Object.values(wins).forEach(({ w }) => { w.style.left = w.style.top = w.style.right = w.style.bottom = ''; delete w.dataset.moved; });
    });

    /* ======================================================================
       4. ÉDITEUR DE CODE
       ====================================================================== */
    const ed = el('div', 'ed');
    const side = el('nav', 'ed-side');
    bindText(side, 'explorerLabel', 'aria-label');
    const sideTitle = bindText(el('p', 'ed-side-title'), 'explorerTitle');
    const sideList = el('div');
    side.append(sideTitle, sideList);
    const main = el('div', 'ed-main');
    const tabs = el('div', 'ed-tabs');
    tabs.setAttribute('role', 'tablist');
    const paneMd = el('div', 'ed-pane');
    const paneTs = el('div', 'ed-pane');
    const status = el('div', 'ed-status', '<span>main</span><span data-ln>Ln 1, Col 1</span><span class="push">UTF-8</span><span data-mode>Markdown</span>');
    status.setAttribute('aria-hidden', 'true');
    main.append(tabs, paneMd, paneTs, status);
    ed.append(side, main);

    // bienvenue.md : le vrai contenu de l'accueil
    const copy = $('.hero-copy');
    paneMd.append(el('p', 'md-comment', '&lt;!-- bienvenue.md --&gt;'), ...(copy ? [...copy.children] : []));
    paneMd.querySelector('.md-comment').setAttribute('aria-hidden', 'true');
    const pre = el('pre', 'code');
    paneTs.append(pre);
    paneTs.hidden = true; // jordan.ts n'est tapé que lorsqu'il est affiché

    const FILES = {
        md: { name: 'bienvenue.md', icon: 'file', mode: 'Markdown', pane: paneMd },
        ts: { name: 'jordan.ts', icon: 'code', mode: 'TypeScript', pane: paneTs }
    };
    const sideItems = {};
    let codeTyped = false;
    let codeTyping = false;
    let userTouchedEditor = false;

    // Objet jordan.ts construit à partir des données réelles
    function codeTokens() {
        const D = data();
        const T = (t, c) => ({ t, c });
        const stack = (D.cv?.skills || []).slice(0, 3);
        const school = D.cv?.formations?.[0]?.school || D.about?.education?.[0]?.school || '';
        return [
            T('// jordan.ts\n', 'com'),
            T('export const ', 'kw'), T('jordan', 'var'), T(' = {\n'),
            T('  nom', 'prop'), T(': '), T(JSON.stringify(D.hero?.name || ''), 'str'), T(',\n'),
            T('  role', 'prop'), T(': '), T(JSON.stringify(D.hero?.role || ''), 'str'), T(',\n'),
            ...(school ? [T('  ecole', 'prop'), T(': '), T(JSON.stringify(school), 'str'), T(',\n')] : []),
            T('  statut', 'prop'), T(': '), T(JSON.stringify(D.hero?.availability || ''), 'str'), T(',\n'),
            T('  stack', 'prop'), T(': ['), ...stack.flatMap((s, i) => [T(JSON.stringify(s), 'str'), T(i < stack.length - 1 ? ', ' : '')]), T('],\n'),
            T('  projets', 'prop'), T(': '), T(String((D.projects || []).length), 'num'), T(',\n'),
            T('};\n\n'),
            T(`// ${L().ready}\n`, 'com'),
            T('jordan', 'var'), T('.'), T(L().contactFn, 'prop'), T('('), T(JSON.stringify(D.contact?.email || ''), 'str'), T(');')
        ];
    }
    function renderCodeStatic() {
        pre.textContent = '';
        codeTokens().forEach(({ t, c }) => pre.append(c ? Object.assign(el('span', c), { textContent: t }) : t));
    }
    async function typeCode() {
        if (codeTyped || codeTyping) return;
        if (reduced) { renderCodeStatic(); codeTyped = true; return; }
        codeTyping = true;
        pre.textContent = '';
        const caret = el('span', 'blink');
        pre.append(caret);
        for (const { t, c } of codeTokens()) {
            const span = c ? el('span', c) : document.createTextNode('');
            pre.insertBefore(span, caret);
            for (const ch of t) {
                span.textContent += ch;
                await sleep(ch === '\n' ? 60 : 12 + Math.random() * 20);
            }
        }
        caret.remove();
        renderCodeStatic();
        codeTyping = false;
        codeTyped = true;
    }

    function showFile(key, fromUser = true) {
        if (fromUser) userTouchedEditor = true;
        Object.entries(FILES).forEach(([k, f]) => { f.pane.hidden = k !== key; });
        tabs.querySelectorAll('[role="tab"]').forEach((tab) => {
            const on = tab.dataset.key === key;
            tab.setAttribute('aria-selected', String(on));
            tab.tabIndex = on ? 0 : -1;
        });
        Object.entries(sideItems).forEach(([k, b]) => (k === key ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current')));
        $('[data-mode]', status).textContent = FILES[key].mode;
        refreshEditorTitle();
        if (key === 'ts') typeCode();
    }
    Object.entries(FILES).forEach(([k, f]) => {
        const tab = el('button', 'ed-tab', `${renderIcon(f.icon)}<span></span>`);
        tab.type = 'button';
        tab.dataset.key = k;
        tab.id = `ed-tab-${k}`;
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-controls', `ed-pane-${k}`);
        $('span', tab).textContent = f.name;
        f.pane.id = `ed-pane-${k}`;
        f.pane.setAttribute('role', 'tabpanel');
        f.pane.setAttribute('aria-labelledby', tab.id);
        tab.addEventListener('click', () => showFile(k));
        tab.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                const next = k === 'md' ? 'ts' : 'md';
                showFile(next);
                $(`#ed-tab-${next}`).focus();
            }
        });
        tabs.append(tab);
    });

    const sideItem = (label, ext, depth, onClick, extra = '') => {
        const iconName = { md: 'file', ts: 'code', tsx: 'code', json: 'database', sh: 'terminal', pdf: 'file', folder: 'briefcase' }[ext];
        const b = el('button', `ed-item ${extra}`, `${renderIcon(iconName)}<span></span>`);
        b.type = 'button';
        $('span', b).textContent = label;
        b.title = label;
        b.dataset.ext = ext;
        b.style.setProperty('--depth', String(depth));
        b.addEventListener('click', onClick);
        sideList.append(b);
        return b;
    };
    const keepFocus = (container, rebuild) => {
        const i = [...container.querySelectorAll('button')].indexOf(document.activeElement);
        rebuild();
        if (i < 0) return;
        const all = container.querySelectorAll('button');
        all[Math.min(i, all.length - 1)]?.focus({ preventScroll: true });
    };
    function renderExplorer() {
        sideList.textContent = '';
        sideItem('portfolio', 'folder', 0, () => {}, 'is-folder');
        sideItems.md = sideItem('bienvenue.md', 'md', 1, () => showFile('md'));
        sideItems.ts = sideItem('jordan.ts', 'ts', 1, () => showFile('ts'));
        sideItem('projets/', 'folder', 1, () => openWin('projects'), 'is-folder');
        (data().projects || []).forEach((p) => sideItem(`${slug(p.cardTitle || p.title)}.tsx`, 'tsx', 2, () => openCase(p.id)));
        sideItem('a-propos.md', 'md', 1, () => go('about'));
        sideItem('parcours.json', 'json', 1, () => go('experience'));
        sideItem('competences.ts', 'ts', 1, () => go('skills'));
        sideItem('contact.sh', 'sh', 1, () => go('contact'));
        sideItem('cv.pdf', 'pdf', 1, openCv);
        showFile(paneTs.hidden ? 'md' : 'ts', false);
    }
    paneMd.addEventListener('scroll', () => { $('[data-ln]', status).textContent = `Ln ${Math.round(paneMd.scrollTop / 24) + 1}, Col 1`; }, { passive: true });
    ed.addEventListener('pointerdown', () => { userTouchedEditor = true; });
    ed.addEventListener('keydown', () => { userTouchedEditor = true; });
    ed.addEventListener('focusin', () => { userTouchedEditor = true; });
    function refreshEditorTitle() {
        const t = wins.editor?.titleEl;
        if (!t) return;
        t.textContent = `${paneTs.hidden ? 'bienvenue.md' : 'jordan.ts'} - ${L().editor}`;
        renderTasks();
    }
    renderExplorer();
    showFile('md', false);
    makeWindow('editor', null, 'code', ed, { dark: true, title: 'bienvenue.md - Éditeur' });
    refreshEditorTitle();

    /* ======================================================================
       5. PHOTO ET EXPLORATEUR DE PROJETS
       ====================================================================== */
    const photoNodes = [$('.portrait'), $('.hero-caption')].filter(Boolean);
    makeWindow('photo', null, 'file', photoNodes, { title: 'photo.jpg' });

    const files = el('div', 'os-files');
    function renderProjectFiles() {
        files.textContent = '';
        (data().projects || []).forEach((p) => {
            const b = el('button', 'os-file', '<span></span><small></small>');
            b.type = 'button';
            // Vignette seulement si l'image est renseignée et d'un schéma sûr (sinon pas d'image cassée)
            const okImg = p.image && /^(https?:\/\/|data:image\/(png|jpe?g|webp|gif|avif);|\/|\.\/|[a-z0-9_-]+\/)/i.test(p.image);
            if (okImg) {
                const img = document.createElement('img');
                img.alt = '';
                img.loading = 'lazy';
                img.src = p.image;
                b.prepend(img);
            }
            $('span', b).textContent = p.cardTitle || p.title || '';
            $('small', b).textContent = p.categoryLabel || '';
            b.addEventListener('click', () => openCase(p.id));
            files.append(b);
        });
    }
    renderProjectFiles();
    makeWindow('projects', 'explorer', 'briefcase', files, { hidden: true });
    const projTitle = wins.projects.titleEl;
    const refreshProjTitle = () => { projTitle.textContent = `projets/ - ${L().explorer}`; };
    refreshProjTitle();

    /* ======================================================================
       6. TERMINAL
       ====================================================================== */
    const term = el('div', 'term');
    term.setAttribute('role', 'log');
    term.setAttribute('aria-live', 'off'); // activé après la séquence d'ouverture (évite d'annoncer chaque caractère)
    const PS = '<span class="ps" aria-hidden="true"><span class="u">jordan@os</span>:<span class="p">~</span>$</span>';
    const inRow = el('label', 'term-input-row', `${PS}<input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" />`);
    const input = $('input', inRow);
    bindText(input, 'termInput', 'aria-label');
    inRow.hidden = true;
    term.append(inRow);
    makeWindow('terminal', null, 'terminal', term, { dark: true, title: 'Terminal - zsh' });

    const print = (text, cls = '') => {
        const d = el('div', `ln ${cls}`);
        d.textContent = text;
        term.insertBefore(d, inRow);
        term.scrollTop = term.scrollHeight;
        return d;
    };
    const echo = (cmd) => {
        const d = el('div', 'ln', `${PS} `);
        d.append(cmd);
        term.insertBefore(d, inRow);
    };
    const neofetch = () => {
        const D = data();
        const stack = (D.cv?.skills || []).slice(0, 3).join(', ');
        const school = D.cv?.formations?.[0]?.school || D.about?.education?.[0]?.school || '';
        return [
            '     _ ____      jordan@os',
            '    | |  _ \\     ---------',
            ' _  | | | | |    OS     : JordanOS',
            '| |_| | |_| |    Shell  : zsh',
            ` \\___/|____/     ${L().nf[0]}: ${D.hero?.role || ''}`,
            `                 ${L().nf[1]}: ${school}`,
            `                 Stack  : ${stack}`,
            `                 ${L().nf[2]}: ${D.hero?.availability || ''}`
        ].join('\n');
    };
    const OPEN = { editeur: 'editor', éditeur: 'editor', editor: 'editor', photo: 'photo', 'photo.jpg': 'photo', projets: 'projects', projects: 'projects', terminal: 'terminal' };
    const COMMANDS = {
        help: () => print('help  whoami  neofetch  ls  projets  apropos  parcours  competences  contact  cv  email  code  open  lang  clear  exit'),
        whoami: () => { const D = data(); print(`${D.hero?.name || ''} | ${D.hero?.role || ''} | ${D.hero?.availability || ''}`); },
        neofetch: () => print(neofetch(), 'ascii-art'),
        ls: () => print('bienvenue.md  jordan.ts  photo.jpg  projets/  a-propos.md  parcours.json  competences.ts  contact.sh  cv.pdf'),
        projets: () => {
            (data().projects || []).forEach((p) => print(`  ${String(p.cardTitle || p.title || '').padEnd(26, ' ')} ${p.categoryLabel || ''}`));
            openWin('projects');
            print(L().opened('projets/'), 'ok');
        },
        apropos: () => { print(L().goTo('a-propos'), 'ok'); go('about'); },
        parcours: () => { print(L().goTo('parcours'), 'ok'); go('experience'); },
        competences: () => { print(L().goTo('competences'), 'ok'); go('skills'); },
        contact: () => { print('→ ./contact.sh', 'ok'); go('contact'); },
        cv: () => { print(L().openingCv, 'ok'); openCv(); },
        email: () => print(data().contact?.email || '', 'ok'),
        code: (arg) => { openWin('editor'); showFile(arg && arg.startsWith('bienvenue') ? 'md' : 'ts'); print(L().openingCode, 'ok'); },
        open: (arg) => { if (Object.prototype.hasOwnProperty.call(OPEN, arg)) { openWin(OPEN[arg]); print(L().opened(arg), 'ok'); } else print(L().usageOpen, 'err'); },
        lang: () => { document.getElementById('lang-toggle')?.click(); print(L().langSwitched, 'ok'); },
        clear: () => term.querySelectorAll('.ln').forEach((n) => n.remove()),
        exit: () => closeWin('terminal')
    };
    // Alias anglais
    Object.assign(COMMANDS, { projects: COMMANDS.projets, about: COMMANDS.apropos, journey: COMMANDS.parcours, experience: COMMANDS.parcours, skills: COMMANDS.competences, resume: COMMANDS.cv });

    const history = [];
    let hIndex = 0;
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const raw = input.value.trim();
            input.value = '';
            if (!raw) return;
            history.push(raw);
            hIndex = history.length;
            echo(raw);
            const [cmd0, ...args] = raw.toLowerCase().split(/\s+/);
            const cmd = cmd0.replace(/^\.\//, '').replace(/\.(sh|md|pdf|json|ts)$/, '');
            if (cmd === 'sudo') print(L().denied, 'err');
            else if (Object.prototype.hasOwnProperty.call(COMMANDS, cmd)) COMMANDS[cmd](args.join(' '));
            else print(L().notFound(cmd), 'err');
            term.scrollTop = term.scrollHeight;
        } else if (e.key === 'ArrowUp') {
            if (hIndex > 0) input.value = history[--hIndex];
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            hIndex = Math.min(history.length, hIndex + 1);
            input.value = history[hIndex] || '';
            e.preventDefault();
        } else if (e.key === 'Tab' && input.value) {
            const m = Object.keys(COMMANDS).find((c) => c.startsWith(input.value.toLowerCase()));
            if (m) { input.value = m; e.preventDefault(); }
        }
    });
    term.addEventListener('click', () => { if (!inRow.hidden && !window.getSelection()?.toString()) input.focus({ preventScroll: true }); });

    // Séquence d'ouverture (un clic dans le terminal l'accélère)
    let fast = reduced;
    term.addEventListener('pointerdown', () => { fast = true; }, { once: true });
    async function typeCmd(cmd) {
        const d = el('div', 'ln', `${PS} `);
        const c = el('span');
        const caret = el('span', 'caret');
        d.append(c, caret);
        term.insertBefore(d, inRow);
        for (let i = 1; i <= cmd.length && !fast; i++) {
            c.textContent = cmd.slice(0, i);
            await sleep(45 + Math.random() * 45);
        }
        c.textContent = cmd;
        caret.remove();
        await sleep(fast ? 0 : 200);
    }
    (async () => {
        await sleep(reduced ? 0 : (showBoot ? 1900 : 900));
        await typeCmd('whoami');
        COMMANDS.whoami();
        await typeCmd('neofetch');
        COMMANDS.neofetch();
        // Sur mobile, l'éditeur reste sur bienvenue.md : c'est le premier écran (titre, boutons)
        const showCode = !reduced && isDesk();
        if (showCode) {
            await typeCmd('code jordan.ts');
            print(L().openingCode, 'ok');
            // Pas de bascule si le visiteur a déjà choisi, ou si le focus est dans bienvenue.md
            if (!userTouchedEditor && !paneMd.contains(document.activeElement)) showFile('ts', false);
        }
        print(L().termHint, 'hint');
        inRow.hidden = false;
        term.setAttribute('aria-live', 'polite');
        // Le code reste affiché quelques secondes, puis l'éditeur revient au contenu principal
        if (showCode) {
            await sleep(9000);
            if (!userTouchedEditor && !paneTs.hidden) showFile('md', false);
        }
    })();

    /* ======================================================================
       7. ICÔNES, BARRE DES TÂCHES, MENU DÉMARRER, HORLOGE
       ====================================================================== */
    const iconBox = el('nav', 'os-icons');
    bindText(iconBox, 'icons', 'aria-label');
    [
        { key: 'editor', ic: 'code', tone: 'code', run: (b) => openWin('editor', b) },
        { key: 'terminal', ic: 'terminal', tone: 'term', run: (b) => { openWin('terminal', b); if (!inRow.hidden) input.focus({ preventScroll: true }); } },
        { key: 'projects', ic: 'briefcase', tone: 'accent', run: (b) => openWin('projects', b) },
        { label: 'photo.jpg', ic: 'file', run: (b) => openWin('photo', b) },
        { label: 'cv.pdf', ic: 'download', run: openCv },
        { key: 'journey', ic: 'graduation', run: () => go('experience') },
        { key: 'contact', ic: 'mail', run: () => go('contact') }
    ].forEach((d) => {
        const b = el('button', 'os-icon', `${renderIcon(d.ic)}<span></span>`);
        b.type = 'button';
        if (d.key) bindText($('span', b), d.key); else $('span', b).textContent = d.label;
        if (d.tone) b.dataset.tone = d.tone;
        b.addEventListener('click', () => d.run(b));
        iconBox.append(b);
    });
    desk.prepend(iconBox);

    const taskbar = el('div', 'os-taskbar');
    const start = el('button', 'os-start', 'JD');
    start.type = 'button';
    bindText(start, 'start', 'aria-label');
    start.setAttribute('aria-expanded', 'false');
    start.setAttribute('aria-controls', 'os-menu');
    const searchBtn = el('button', 'os-search', `${renderIcon('search')}<span></span><kbd>Ctrl K</kbd>`);
    searchBtn.type = 'button';
    bindText($('span', searchBtn), 'search');
    bindText(searchBtn, 'palette', 'aria-label');
    const clock = el('div', 'os-clock');
    clock.setAttribute('aria-hidden', 'true');
    taskbar.append(start, searchBtn, tasks, clock);
    hero.append(taskbar);

    function renderTasks() {
        Object.entries(wins).forEach(([id, { w, titleEl, task }]) => {
            const open = !w.hidden;
            task.classList.toggle('is-open', open);
            task.classList.toggle('is-focused', open && w.classList.contains('is-focused'));
            task.setAttribute('aria-pressed', String(open));
            // Étiquette stable par application (le titre de l'éditeur, lui, change selon l'onglet)
            $('span', task).textContent = { editor: L().editor, terminal: L().terminal, projects: 'projets/' }[id] || titleEl.textContent.split(' - ')[0];
        });
    }
    const tick = () => {
        const d = new Date();
        const loc = document.documentElement.lang === 'en' ? 'en-GB' : 'fr-FR';
        clock.innerHTML = `${d.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' })}<br>${d.toLocaleDateString(loc)}`;
    };
    tick();
    setInterval(tick, 20000);

    const menu = el('div', 'os-menu');
    menu.id = 'os-menu';
    menu.hidden = true;
    const menuTitle = el('p', 'os-menu-title', 'JordanOS');
    menu.append(menuTitle);
    [
        ['editor', 'code', () => openWin('editor')],
        ['terminal', 'terminal', () => openWin('terminal')],
        ['projects', 'briefcase', () => go('projects')],
        ['about', 'file', () => go('about')],
        ['journey', 'graduation', () => go('experience')],
        ['skills', 'code', () => go('skills')],
        ['contact', 'mail', () => go('contact')],
        ['actCv', 'download', openCv]
    ].forEach(([key, ic, run]) => {
        const b = el('button', null, `${renderIcon(ic)}<span></span>`);
        b.type = 'button';
        bindText($('span', b), key);
        b.addEventListener('click', () => { toggleMenu(false); start.focus({ preventScroll: true }); run(); });
        menu.append(b);
    });
    hero.append(menu);
    function toggleMenu(open = menu.hidden) {
        menu.hidden = !open;
        start.setAttribute('aria-expanded', String(open));
        if (open) {
            animate(menu, [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 220 });
            $('button', menu).focus();
        }
    }
    start.addEventListener('click', () => toggleMenu());
    document.addEventListener('pointerdown', (e) => { if (!menu.hidden && !menu.contains(e.target) && e.target !== start) toggleMenu(false); });
    menu.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { toggleMenu(false); start.focus(); }
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            const items = [...menu.querySelectorAll('button')];
            const i = items.indexOf(document.activeElement);
            items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length].focus();
            e.preventDefault();
        }
    });

    /* ======================================================================
       8. PALETTE DE COMMANDES GLOBALE (Ctrl+K)
       ====================================================================== */
    const palette = el('dialog', 'palette', '<input type="text" role="combobox" aria-expanded="true" aria-autocomplete="list" aria-controls="palette-list" autocomplete="off" spellcheck="false" /><ul id="palette-list" role="listbox"></ul>');
    bindText(palette, 'palette', 'aria-label');
    document.body.append(palette);
    const pIn = $('input', palette);
    const pList = $('ul', palette);
    bindText(pIn, 'paletteHint', 'placeholder');
    bindText(pIn, 'palette', 'aria-label');
    bindText(pList, 'palette', 'aria-label');

    const actions = () => {
        const t = L();
        return [
            { label: t.actOpenEditor, hint: t.app, ic: 'code', run: () => openWin('editor') },
            { label: t.actOpenTerminal, hint: t.app, ic: 'terminal', run: () => { openWin('terminal'); if (!inRow.hidden) input.focus({ preventScroll: true }); } },
            { label: t.actShowCode, hint: t.file, ic: 'code', run: () => { openWin('editor'); showFile('ts'); } },
            { label: t.actOpenProjects, hint: t.app, ic: 'briefcase', run: () => openWin('projects') },
            ...(data().projects || []).map((p) => ({ label: t.actCase(p.cardTitle || p.title || ''), hint: t.project, ic: 'briefcase', run: () => openCase(p.id) })),
            { label: t.actGo(t.about), hint: 'a-propos.md', ic: 'file', run: () => go('about') },
            { label: t.actGo(t.journey), hint: 'parcours.json', ic: 'graduation', run: () => go('experience') },
            { label: t.actGo(t.skills), hint: 'competences.ts', ic: 'code', run: () => go('skills') },
            { label: t.actGo(t.contact), hint: 'contact.sh', ic: 'mail', run: () => go('contact') },
            { label: t.actCv, hint: 'cv.pdf', ic: 'download', run: openCv },
            { label: t.actCopy, hint: data().contact?.email || '', ic: 'mail', run: () => document.getElementById('copy-email-btn')?.click() },
            { label: t.actLang, hint: 'lang', ic: 'translate', run: () => document.getElementById('lang-toggle')?.click() }
        ];
    };
    let shown = [];
    let sel = 0;
    function renderPalette() {
        const q = pIn.value.trim().toLowerCase();
        shown = actions().filter((a) => !q || q.split(/\s+/).every((w) => `${a.label} ${a.hint}`.toLowerCase().includes(w)));
        sel = Math.min(sel, Math.max(0, shown.length - 1));
        pList.textContent = '';
        if (!shown.length) {
            const li = el('li', 'palette-empty');
            li.textContent = L().noMatch;
            pList.append(li);
            pIn.removeAttribute('aria-activedescendant');
            return;
        }
        shown.forEach((a, i) => {
            const li = el('li', null, `${renderIcon(a.ic)}<span></span><small></small>`);
            li.id = `palette-opt-${i}`;
            li.setAttribute('role', 'option');
            li.setAttribute('aria-selected', String(i === sel));
            $('span', li).textContent = a.label;
            $('small', li).textContent = a.hint;
            li.addEventListener('click', () => { palette.close(); a.run(); });
            pList.append(li);
        });
        pIn.setAttribute('aria-activedescendant', `palette-opt-${sel}`);
    }
    const openPalette = () => { pIn.value = ''; sel = 0; renderPalette(); palette.showModal(); pIn.focus(); };
    searchBtn.addEventListener('click', openPalette);
    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (palette.open) palette.close();
            else if (!document.querySelector('dialog[open]')) openPalette();
        }
    });
    pIn.addEventListener('input', () => { sel = 0; renderPalette(); });
    pIn.addEventListener('keydown', (e) => {
        if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && shown.length) {
            e.preventDefault();
            sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + shown.length) % shown.length;
            renderPalette();
            $(`#palette-opt-${sel}`, pList)?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter' && shown[sel]) {
            e.preventDefault();
            palette.close();
            shown[sel].run();
        }
    });
    palette.addEventListener('click', (e) => { if (e.target === palette) palette.close(); });

    /* ======================================================================
       9. SECTIONS : NUMÉROS DE LIGNE ET INVITES TAPÉES
       ====================================================================== */
    const PROMPTS = {
        projects: ['~/projets', 'ls -la'],
        about: ['~', 'cat a-propos.md'],
        experience: ['~', 'git log --oneline parcours'],
        skills: ['~', 'cat competences.json | jq'],
        contact: ['~', './contact.sh --stage']
    };
    const gutters = [];
    Object.entries(PROMPTS).forEach(([id, [path, cmd]]) => {
        const wrap = document.querySelector(`#${id} > .wrap[data-file]`);
        if (!wrap) return;
        const g = el('pre', 'sec-gutter');
        g.setAttribute('aria-hidden', 'true');
        wrap.prepend(g);
        gutters.push([wrap, g]);
        const head = wrap.querySelector('.section-title, .statement');
        if (!head) return;
        const holder = head.closest('.projects-head') || head;
        const p = el('div', 'section-prompt', '<span class="u">jordan@os</span>:<span class="p"></span>$ <span class="c"></span>');
        p.setAttribute('aria-hidden', 'true');
        $('.p', p).textContent = path;
        holder.before(p);
        const typeIt = async () => {
            const c = $('.c', p);
            if (reduced) { c.textContent = cmd; return; }
            const caret = el('span', 'caret');
            p.append(caret);
            for (let i = 1; i <= cmd.length; i++) { c.textContent = cmd.slice(0, i); await sleep(32 + Math.random() * 35); }
            await sleep(600);
            caret.remove();
        };
        if (!('IntersectionObserver' in window)) { $('.c', p).textContent = cmd; return; }
        new IntersectionObserver(([entry], obs) => {
            if (!entry.isIntersecting) return;
            obs.disconnect();
            typeIt();
        }, { threshold: 1 }).observe(p);
    });
    const fillGutters = () => gutters.forEach(([wrap, g]) => {
        const n = Math.max(1, Math.ceil((wrap.offsetHeight - 38) / 24));
        g.textContent = Array.from({ length: n }, (_, i) => i + 1).join('\n');
    });
    fillGutters();
    window.addEventListener('resize', fillGutters);
    window.addEventListener('load', fillGutters);
    document.fonts?.ready.then(fillGutters);

    /* ======================================================================
       10. LANGUE ET DONNÉES EN DIRECT
       ====================================================================== */
    document.addEventListener('portfolio:lang', () => {
        localized.forEach(applyOne);
        refreshEditorTitle();
        refreshProjTitle();
        renderTasks();
        tick();
        if (codeTyped) renderCodeStatic();
        if (palette.open) renderPalette();
        requestAnimationFrame(fillGutters);
    });
    document.addEventListener('portfolio:rendered', () => {
        keepFocus(sideList, renderExplorer);
        keepFocus(files, renderProjectFiles);
        if (codeTyped) renderCodeStatic();
        requestAnimationFrame(fillGutters);
    });

    /* ======================================================================
       11. DISPOSITION : TERMINAL SOUS LA PHOTO (ordinateur)
       ====================================================================== */
    function fitTerminal() {
        const tw = wins.terminal.w;
        const pw = wins.photo.w;
        if (!isDesk()) { term.style.height = ''; return; }
        if (tw.dataset.moved) return;
        const d = desk.getBoundingClientRect();
        const top = pw.hidden || pw.dataset.moved ? 20 : Math.round(pw.offsetTop + pw.offsetHeight + 16);
        const bar = tw.querySelector('.os-bar').offsetHeight || 36;
        const avail = d.height - top - 20 - bar;
        term.style.height = `${Math.max(140, Math.min(320, avail))}px`;
        Object.assign(tw.style, { top: `${top}px`, bottom: 'auto' });
    }
    fitTerminal();
    window.addEventListener('resize', fitTerminal);
    window.addEventListener('load', fitTerminal);
    document.fonts?.ready.then(fitTerminal);
    $('.portrait img', wins.photo.w)?.addEventListener('load', fitTerminal);

    /* ======================================================================
       12. ENTRÉE
       ====================================================================== */
    focusWin('editor');
    renderTasks();
    if (!reduced) {
        const delay = showBoot ? 1300 : 80;
        [...iconBox.children].forEach((b, i) => animate(b, [{ opacity: 0, transform: 'translateX(-20px)' }, { opacity: 1, transform: 'none' }], { duration: 500, delay: delay + i * 40, fill: 'backwards' }));
        Object.values(wins).filter(({ w }) => !w.hidden).forEach(({ w }, i) => animate(w, [{ opacity: 0, transform: 'translateY(40px) scale(0.94)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: delay + 100 + i * 120, fill: 'backwards' }));
        animate(taskbar, [{ transform: 'translateY(52px)' }, { transform: 'none' }], { duration: 600, delay, fill: 'backwards' });
    }
});
