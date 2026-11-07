/* ==========================================================================
   PORTFOLIO - JORDAN DIBANGOUP - RENDU ET INTERACTIONS ("ATELIER")
   ==========================================================================
   Tout le contenu vient de PORTFOLIO_DATA (js/portfolio-data.js, édité depuis
   le dashboard). Aucun style ni script inline : compatible avec la CSP stricte
   de server.js. Les fenêtres utilisent <dialog> (focus piégé, Échap, retour
   du focus à l'élément déclencheur).
*/
document.addEventListener('DOMContentLoaded', () => {

    PORTFOLIO_DATA = DEFAULT_PORTFOLIO_DATA;

    const root = document.documentElement;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let hasRendered = false;

    /* ======================================================================
       1. UTILITAIRES
       ====================================================================== */
    const $ = (id) => document.getElementById(id);

    // Échappe les caractères HTML spéciaux pour prévenir toute injection
    const escapeHtml = (str) => String(str ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));

    // Ne laisse passer que les URLs http(s) valides ou relatives sûres
    const safeUrl = (url) => {
        if (!url) return '';
        if (url === '#') return '#';
        try {
            const parsed = new URL(url, document.baseURI);
            return (parsed.protocol === 'http:' || parsed.protocol === 'https:') ? parsed.href : '#';
        } catch {
            return '#';
        }
    };

    // Images : comme safeUrl, mais accepte aussi les images importées depuis le
    // dashboard (stockées en data:image/...;base64, autorisées par la CSP img-src)
    const safeImg = (url) => (/^data:image\/(png|jpe?g|webp|gif|avif);base64,[a-z0-9+/=\s]+$/i.test(url || '') ? url : safeUrl(url));

    const hasLink = (url) => Boolean(url && url !== '#');

    // Remplace chaque [data-icon="nom"] par le SVG correspondant (voir icons.js)
    const hydrateIcons = (scope = document) => {
        scope.querySelectorAll('[data-icon]').forEach((el) => {
            const name = el.getAttribute('data-icon');
            el.outerHTML = renderIcon(name, name === 'arrowRight' ? 'icon-arrow' : '');
        });
    };

    /* ======================================================================
       2. TRADUCTIONS (FR / EN)
       ====================================================================== */
    const TRANSLATIONS = {
        fr: {
            'a11y.skip': 'Aller au contenu',
            'nav.projects': 'Projets',
            'nav.about': 'À propos',
            'nav.experience': 'Parcours',
            'nav.skills': 'Compétences',
            'nav.contact': 'Contact',
            'cta.cv': 'Mon CV',
            'cta.projects': 'Voir les projets',
            'stack.title': 'Technologies utilisées',
            'projects.title': 'Projets sélectionnés',
            'projects.filter_all': 'Tous',
            'projects.filter_web': 'Web',
            'projects.filter_mobile': 'Mobile',
            'projects.filters': 'Filtrer les projets',
            'projects.empty': "Aucun projet dans cette catégorie pour l'instant.",
            'projects.case': "Voir l'étude de cas",
            'projects.browser': 'Navigateur',
            'projects.noPreview': 'Aperçu bientôt disponible',
            'projects.demo': 'Démo',
            'projects.code': 'Code',
            'case.context': 'Contexte',
            'case.architecture': 'Architecture',
            'case.features': 'Fonctionnalités clés',
            'case.stack': 'Technologies',
            'case.visit': 'Voir le projet',
            'case.source': 'Code source',
            'about.values': 'Ce qui guide mon travail',
            'experience.title': 'Parcours',
            'experience.work': 'Expériences',
            'experience.edu': 'Formation',
            'skills.title': 'Compétences',
            'skills.sub': "Les outils que j'utilise au quotidien, classés par domaine et par niveau de maîtrise.",
            'skills.languages': 'Langues',
            'contact.title': 'Travaillons ensemble.',
            'contact.sub': 'Un stage, une alternance ou un projet ? Écrivez-moi directement.',
            'contact.copy': "Copier l'adresse e-mail",
            'contact.label_name': 'Nom complet',
            'contact.label_email': 'Adresse e-mail',
            'contact.label_subject': 'Sujet',
            'contact.label_message': 'Message',
            'contact.btn_send': 'Envoyer le message',
            'contact.sending': 'Envoi en cours…',
            'contact.sent': 'Message envoyé',
            'form.required': 'Ce champ est obligatoire.',
            'form.email': 'Saisissez une adresse e-mail valide, par exemple nom@example.com.',
            'form.sent': 'Message envoyé. Je vous réponds au plus vite.',
            'form.error': "L'envoi a échoué. Réessayez dans un instant.",
            'form.network': 'Impossible de joindre le serveur. Vérifiez votre connexion.',
            'copy.ok': 'Adresse e-mail copiée.',
            'copy.fail': "La copie a échoué. Sélectionnez l'adresse manuellement.",
            'footer.top': 'Haut de page',
            'footer.rights': 'Tous droits réservés.',
            'cv.print': 'Télécharger en PDF',
            'cv.title': 'Mon CV',
            'cv.page': 'Page',
            'cv.loading': 'Chargement du CV…',
            'cv.unavailable': 'Le CV sera bientôt disponible.',
            'cv.error': "Impossible d'afficher le CV ici.",
            'cv.downloadInstead': 'Télécharger le PDF',
            'ui.close': 'Fermer',
            'ui.menu_open': 'Ouvrir le menu',
            'ui.menu_close': 'Fermer le menu',
            'ui.home': 'Retour en haut de page',
            'ui.theme_dark': 'Passer en thème sombre',
            'ui.theme_light': 'Passer en thème clair',
            'ui.lang_other': 'Switch to English',
            'ui.lang_switched': 'Langue : français',
            'ui.live_update': 'Portfolio mis à jour en direct.',
            'ui.marquee_pause': 'Mettre le défilement en pause',
            'ui.marquee_play': 'Reprendre le défilement'
        },
        en: {
            'a11y.skip': 'Skip to content',
            'nav.projects': 'Projects',
            'nav.about': 'About',
            'nav.experience': 'Journey',
            'nav.skills': 'Skills',
            'nav.contact': 'Contact',
            'cta.cv': 'Resume',
            'cta.projects': 'View projects',
            'stack.title': 'Technologies I use',
            'projects.title': 'Selected projects',
            'projects.filter_all': 'All',
            'projects.filter_web': 'Web',
            'projects.filter_mobile': 'Mobile',
            'projects.filters': 'Filter projects',
            'projects.empty': 'No project in this category yet.',
            'projects.case': 'View case study',
            'projects.browser': 'Browser',
            'projects.noPreview': 'Preview coming soon',
            'projects.demo': 'Demo',
            'projects.code': 'Code',
            'case.context': 'Context',
            'case.architecture': 'Architecture',
            'case.features': 'Key features',
            'case.stack': 'Technologies',
            'case.visit': 'Visit project',
            'case.source': 'Source code',
            'about.values': 'What guides my work',
            'experience.title': 'Journey',
            'experience.work': 'Experience',
            'experience.edu': 'Education',
            'skills.title': 'Skills',
            'skills.sub': 'The tools I use every day, grouped by domain and proficiency.',
            'skills.languages': 'Languages',
            'contact.title': "Let's work together.",
            'contact.sub': 'An internship, an apprenticeship or a project? Write to me directly.',
            'contact.copy': 'Copy email address',
            'contact.label_name': 'Full name',
            'contact.label_email': 'Email address',
            'contact.label_subject': 'Subject',
            'contact.label_message': 'Message',
            'contact.btn_send': 'Send message',
            'contact.sending': 'Sending…',
            'contact.sent': 'Message sent',
            'form.required': 'This field is required.',
            'form.email': 'Enter a valid email address, for example name@example.com.',
            'form.sent': "Message sent. I'll get back to you soon.",
            'form.error': 'Sending failed. Please try again in a moment.',
            'form.network': 'Could not reach the server. Check your connection.',
            'copy.ok': 'Email address copied.',
            'copy.fail': 'Copy failed. Please select the address manually.',
            'footer.top': 'Back to top',
            'footer.rights': 'All rights reserved.',
            'cv.print': 'Download as PDF',
            'cv.title': 'My resume',
            'cv.page': 'Page',
            'cv.loading': 'Loading the resume…',
            'cv.unavailable': 'The resume will be available soon.',
            'cv.error': 'The resume cannot be displayed here.',
            'cv.downloadInstead': 'Download the PDF',
            'ui.close': 'Close',
            'ui.menu_open': 'Open menu',
            'ui.menu_close': 'Close menu',
            'ui.home': 'Back to top',
            'ui.theme_dark': 'Switch to dark theme',
            'ui.theme_light': 'Switch to light theme',
            'ui.lang_other': 'Passer en français',
            'ui.lang_switched': 'Language: English',
            'ui.live_update': 'Portfolio updated live.',
            'ui.marquee_pause': 'Pause scrolling',
            'ui.marquee_play': 'Resume scrolling'
        }
    };

    let currentLang = 'fr';
    try {
        currentLang = localStorage.getItem('portfolio_lang') === 'en' ? 'en' : 'fr';
    } catch { /* stockage indisponible */ }

    const t = (key) => (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) || TRANSLATIONS.fr[key] || key;

    /* ======================================================================
       3. TOASTS
       ====================================================================== */
    const toastContainer = $('toast-container');
    const showToast = (message, type = 'info') => {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const iconName = type === 'success' ? 'check' : type === 'error' ? 'error' : 'info';
        toast.innerHTML = `${renderIcon(iconName)}<div>${escapeHtml(message)}</div>`;
        toastContainer.appendChild(toast);
        requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 350);
        }, 4200);
    };

    /* ======================================================================
       4. APPARITION AU DÉFILEMENT
       ====================================================================== */
    const revealObserver = (!prefersReducedMotion && 'IntersectionObserver' in window)
        ? new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 })
        : null;

    const observeReveals = () => {
        document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => {
            if (revealObserver) revealObserver.observe(el);
            else el.classList.add('is-in');
        });
    };

    /* ======================================================================
       5. FENÊTRES (<dialog>)
       ====================================================================== */
    const openers = new WeakMap();

    const openDialog = (dialog) => {
        if (!dialog || dialog.open) return;
        openers.set(dialog, document.activeElement);
        dialog.showModal();
    };

    // Fermeture animée : chaque dialogue repart par où il est venu (le panneau
    // d'étude de cas glisse à droite, les autres retombent en fondu).
    const closingDialogs = new WeakSet();
    const closeDialog = (dialog, { instant = false } = {}) => {
        if (!dialog || !dialog.open || closingDialogs.has(dialog)) return;
        if (instant || prefersReducedMotion || !dialog.animate) { dialog.close(); return; }
        closingDialogs.add(dialog);
        const sheet = dialog.classList.contains('sheet');
        const opts = { duration: sheet ? 240 : 160, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' };
        const box = dialog.animate(sheet
            ? [{ transform: 'none' }, { transform: 'translateX(100%)' }]
            : [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(8px)' }], opts);
        let backdrop = null;
        try { backdrop = dialog.animate([{ opacity: 1 }, { opacity: 0 }], { ...opts, pseudoElement: '::backdrop' }); } catch { /* non pris en charge */ }
        const done = () => {
            closingDialogs.delete(dialog);
            dialog.close();
            box.cancel();
            backdrop?.cancel();
        };
        box.finished.then(done, done);
    };

    document.querySelectorAll('dialog').forEach((dialog) => {
        // Clic sur le fond (hors de la boîte) : fermeture
        dialog.addEventListener('click', (e) => {
            if (e.target !== dialog) return;
            const r = dialog.getBoundingClientRect();
            const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
            if (!inside) closeDialog(dialog);
        });
        dialog.addEventListener('close', () => {
            const opener = openers.get(dialog);
            if (opener && typeof opener.focus === 'function' && document.contains(opener)) opener.focus();
        });
        // Échap : même sortie animée que le bouton Fermer
        dialog.addEventListener('cancel', (e) => {
            e.preventDefault();
            closeDialog(dialog);
        });
        dialog.querySelectorAll('[data-close-dialog]').forEach((btn) => {
            btn.addEventListener('click', () => closeDialog(dialog));
        });
    });

    /* ======================================================================
       6. RENDU : ACCUEIL ET BANDEAU
       ====================================================================== */
    const renderHero = () => {
        const h = PORTFOLIO_DATA.hero;
        if (!h) return;
        const name = h.name || 'Jordan DIBANGOUP';

        $('hero-name').textContent = name;
        $('hero-role').textContent = h.role || '';
        $('nav-logo-name').textContent = name;
        $('hero-availability').textContent = h.availability || '';
        $('hero-description').textContent = h.description || '';

        // Le titre est coupé à la première virgule : la seconde moitié passe en gris
        const titleEl = $('hero-title');
        const title = h.title || '';
        const cut = title.indexOf(',');
        titleEl.textContent = '';
        if (cut > 0 && cut < title.length - 1) {
            titleEl.append(title.slice(0, cut + 1) + ' ');
            const rest = document.createElement('span');
            rest.className = 'hero-title-muted';
            rest.textContent = title.slice(cut + 1).trim();
            titleEl.append(rest);
        } else {
            titleEl.textContent = title;
        }

        const img = $('hero-img');
        if (h.image) img.src = safeImg(h.image);
        img.alt = `Portrait de ${name}`;

        $('hero-badges').innerHTML = (h.badges || [])
            .filter(Boolean)
            .map((b) => `<span class="chip">${escapeHtml(b)}</span>`)
            .join('');

        document.title = `${name} | Portfolio Développeur Full-Stack & Génie Logiciel`;
    };

    const stackBand = document.querySelector('.stack-band');
    const marqueeBtn = $('marquee-toggle');
    const updateMarqueeButton = () => {
        const paused = stackBand.classList.contains('is-paused');
        marqueeBtn.setAttribute('aria-pressed', String(paused));
        marqueeBtn.setAttribute('aria-label', t(paused ? 'ui.marquee_play' : 'ui.marquee_pause'));
        $('marquee-toggle-icon').innerHTML = renderIcon(paused ? 'play' : 'pause');
    };
    marqueeBtn.addEventListener('click', () => {
        stackBand.classList.toggle('is-paused');
        updateMarqueeButton();
    });

    const renderStack = () => {
        let items = PORTFOLIO_DATA.cv?.skills || [];
        if (!items.length) {
            items = (PORTFOLIO_DATA.skills || []).flatMap((cat) => (cat.items || []).map((i) => i.name));
        }
        const html = items.map((s) => `<li>${escapeHtml(s)}</li>`).join('');
        $('stack-list').innerHTML = html;
        $('stack-list-clone').innerHTML = html;
        stackBand.hidden = items.length === 0;
    };

    /* ======================================================================
       7. RENDU : PROJETS (grille asymétrique + filtre + étude de cas)
       ====================================================================== */
    let currentFilter = 'all';

    // Une ligne par projet : la fenêtre alterne à gauche puis à droite, et les
    // projets sont numérotés dans l'ordre affiché (le filtre recalcule les deux).
    const layoutProjects = () => {
        const cards = [...document.querySelectorAll('#projects-grid .project')];
        const visible = cards.filter((c) => !c.hidden);
        $('projects-empty').hidden = visible.length > 0;
        visible.forEach((card, i) => {
            card.classList.toggle('is-flip', i % 2 === 1);
            const num = card.querySelector('.project-num');
            if (num) num.textContent = String(i + 1).padStart(2, '0');
        });
    };

    // Adresse affichée dans la barre de la fenêtre : « Traçabilité Agricole » → « tracabilite-agricole »
    const slugify = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const applyFilter = () => {
        document.querySelectorAll('#projects-grid .project').forEach((card) => {
            card.hidden = !(currentFilter === 'all' || card.dataset.category === currentFilter);
        });
        layoutProjects();
    };

    const renderProjects = () => {
        const grid = $('projects-grid');
        const projects = PORTFOLIO_DATA.projects || [];

        grid.innerHTML = projects.map((proj, idx) => {
            const tech = (proj.tech || []).slice(0, 4).map(escapeHtml).join(' / ');
            const name = proj.cardTitle || proj.title;
            return `
              <article class="project${hasRendered ? ' is-in' : ''}" data-reveal data-category="${escapeHtml(proj.category)}" data-project-id="${escapeHtml(proj.id)}" data-index="${idx}">
                <div class="project-media">
                  <div class="project-win-bar" aria-hidden="true">
                    ${renderIcon('code')}<span class="project-win-title">${escapeHtml(name)} - ${escapeHtml(t('projects.browser'))}</span>
                    <span class="project-win-ctl"><span>–</span><span>×</span></span>
                  </div>
                  <div class="project-win-url" aria-hidden="true">https://jordan.os/projets/${escapeHtml(slugify(name))}</div>
                  ${proj.image ? `<div class="project-shot">
                    <img src="${escapeHtml(safeImg(proj.image))}" alt="" loading="lazy" width="1200" height="750" />
                  </div>` : `<div class="project-shot is-empty" aria-hidden="true">
                    ${renderIcon('code')}<b>${escapeHtml(name)}</b><span class="mono">${escapeHtml(t('projects.noPreview'))}</span>
                  </div>`}
                </div>
                <div class="project-body">
                  <div class="project-meta">
                    <span class="project-num mono" aria-hidden="true"></span>
                    <span class="project-cat">${escapeHtml(proj.categoryLabel)}</span>
                    ${proj.status ? `<span>${escapeHtml(proj.status)}</span>` : ''}
                  </div>
                  <h3 class="project-title">
                    <button class="project-open" type="button" aria-haspopup="dialog">${escapeHtml(name)}</button>
                  </h3>
                  <p class="project-desc">${escapeHtml(proj.shortDescription)}</p>
                  ${tech ? `<p class="project-tech mono">${tech}</p>` : ''}
                  <div class="project-actions">
                    <span class="project-cue" aria-hidden="true">${escapeHtml(t('projects.case'))} ${renderIcon('arrowUpRight')}</span>
                    ${hasLink(proj.demo) ? `<a class="text-link" href="${escapeHtml(safeUrl(proj.demo))}" target="_blank" rel="noopener noreferrer">${renderIcon('link', 'icon-sm')} ${escapeHtml(t('projects.demo'))}</a>` : ''}
                    ${hasLink(proj.source) ? `<a class="text-link" href="${escapeHtml(safeUrl(proj.source))}" target="_blank" rel="noopener noreferrer">${renderIcon('github', 'icon-sm')} ${escapeHtml(t('projects.code'))}</a>` : ''}
                  </div>
                </div>
              </article>`;
        }).join('');

        grid.querySelectorAll('.project').forEach((card, i) => {
            card.style.setProperty('--reveal-delay', `${Math.min(i, 3) * 0.07}s`);
            card.querySelector('.project-open').addEventListener('click', () => openProjectModal(card.dataset.projectId));
            // La fenêtre ouvre aussi l'étude de cas (souris) ; le bouton titre reste le contrôle accessible
            card.querySelector('.project-media').addEventListener('click', () => openProjectModal(card.dataset.projectId));
        });

        applyFilter();
    };

    // Filtrage animé : les cartes glissent vers leur nouvelle place au lieu de sauter.
    // Les noms de transition ne sont posés que le temps du filtrage, pour ne pas
    // interférer avec le dévoilement du thème. Sans View Transitions : bascule directe.
    let filterTransition = 0;
    const filterWithTransition = () => {
        if (prefersReducedMotion || !document.startViewTransition) return applyFilter();
        const id = ++filterTransition;
        const cards = [...document.querySelectorAll('#projects-grid .project')];
        cards.forEach((c, i) => { c.style.viewTransitionName = `project-${i}`; c.style.viewTransitionClass = 'project'; });
        const vt = document.startViewTransition(applyFilter);
        // Un second clic pendant l'animation ne doit pas effacer les noms de la nouvelle transition
        vt.finished.finally(() => {
            if (id === filterTransition) cards.forEach((c) => { c.style.viewTransitionName = ''; c.style.viewTransitionClass = ''; });
        });
    };

    const filterButtons = document.querySelectorAll('#project-filters .filter-btn');
    filterButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.filter;
            filterButtons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
            filterWithTransition();
        });
    });

    const projectModal = $('project-modal');
    const openProjectModal = (projectId) => {
        const p = (PORTFOLIO_DATA.projects || []).find((x) => x.id === projectId);
        if (!p) return;

        $('project-modal-kicker').textContent = p.categoryLabel || '';

        const block = (icon, titleKey, text) => text ? `
            <div class="case-block">
              <h3>${renderIcon(icon)} ${escapeHtml(t(titleKey))}</h3>
              <p>${escapeHtml(text)}</p>
            </div>` : '';

        const features = (p.features || []).map((f) => `<li>${renderIcon('check')}<span>${escapeHtml(f)}</span></li>`).join('');
        const tech = (p.tech || []).map((x) => `<span class="chip">${escapeHtml(x)}</span>`).join('');

        $('project-modal-content').innerHTML = `
            <div class="case-media">
              <img src="${escapeHtml(safeImg(p.image))}" alt="${escapeHtml(p.title)}" />
            </div>
            <div class="case-meta">
              ${p.status ? `<span class="chip">${escapeHtml(p.status)}</span>` : ''}
            </div>
            <h2 class="case-title" id="project-modal-title">${escapeHtml(p.title)}</h2>
            <p class="case-desc">${escapeHtml(p.description)}</p>
            ${(hasLink(p.demo) || hasLink(p.source)) ? `
            <div class="case-links">
              ${hasLink(p.demo) ? `<a class="btn btn-primary btn-sm" href="${escapeHtml(safeUrl(p.demo))}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('case.visit'))} ${renderIcon('arrowUpRight')}</a>` : ''}
              ${hasLink(p.source) ? `<a class="btn btn-ghost btn-sm" href="${escapeHtml(safeUrl(p.source))}" target="_blank" rel="noopener noreferrer">${renderIcon('github')} ${escapeHtml(t('case.source'))}</a>` : ''}
            </div>` : ''}
            ${(p.context || p.architecture) ? `
            <div class="case-blocks">
              ${block('target', 'case.context', p.context)}
              ${block('terminal', 'case.architecture', p.architecture)}
            </div>` : ''}
            ${features ? `<h3 class="case-section-title">${escapeHtml(t('case.features'))}</h3><ul class="case-features">${features}</ul>` : ''}
            ${tech ? `<h3 class="case-section-title">${escapeHtml(t('case.stack'))}</h3><div class="case-tech">${tech}</div>` : ''}
        `;

        projectModal.scrollTop = 0;
        openDialog(projectModal);
    };

    /* ======================================================================
       8. RENDU : À PROPOS, PARCOURS, COMPÉTENCES, CONTACT
       ====================================================================== */
    const renderAbout = () => {
        const a = PORTFOLIO_DATA.about;
        if (!a) return;

        $('about-story-title').textContent = a.title || '';
        $('about-paragraphs').innerHTML = (a.paragraphs || []).map((p) => `<p>${escapeHtml(p)}</p>`).join('');
        $('about-journey-1').textContent = a.journey?.text1 || '';
        $('about-journey-2').textContent = a.journey?.text2 || '';
        document.querySelector('.about-journey').hidden = !(a.journey?.text1 || a.journey?.text2);

        // Icône choisie dans le dashboard (champ "icon"), sinon devinée d'après le titre.
        // Le champ "emoji" des anciennes données n'est plus affiché.
        const VALUE_ICONS = ['lightbulb', 'palette', 'shield', 'book', 'team', 'bolt', 'compass', 'code', 'star'];
        const valueIcon = (title) => {
            const t = String(title || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
            if (/innov|creat|idee/.test(t)) return 'lightbulb';
            if (/design|ergonom|ux|ui|esthet/.test(t)) return 'palette';
            if (/rigueur|qualit|fiab|secur|technique|propre/.test(t)) return 'shield';
            if (/apprent|veille|curios|formation|learn/.test(t)) return 'book';
            if (/equipe|collab|partage|communic|team/.test(t)) return 'team';
            if (/perform|rapid|efficac|optimi/.test(t)) return 'bolt';
            return 'compass';
        };
        $('about-values-container').innerHTML = (a.values || []).map((v) => `
            <li class="value">
              <span class="value-icon" aria-hidden="true">${renderIcon(VALUE_ICONS.includes(v.icon) ? v.icon : valueIcon(v.title))}</span>
              <div class="value-text">
                <h4 class="value-title">${escapeHtml(v.title)}</h4>
                <p class="value-desc">${escapeHtml(v.desc)}</p>
              </div>
            </li>`).join('');
    };

    const renderTimeline = () => {
        const container = $('timeline-container');
        let items = PORTFOLIO_DATA.timeline || [];

        // Sans frise renseignée : repli sur les expériences du CV et les études
        if (!items.length) {
            items = [
                ...(PORTFOLIO_DATA.cv?.experiences || []).map((e) => ({
                    period: e.dates, role: e.role, organization: e.company, description: e.description, type: 'experience'
                })),
                ...(PORTFOLIO_DATA.about?.education || []).map((e) => ({
                    period: e.dates, role: e.degree, organization: e.school, description: e.desc, type: 'formation'
                }))
            ];
        }

        const itemHtml = (item) => `
            <li class="track-item">
              <span class="track-period mono">${escapeHtml(item.period)}</span>
              <h4 class="track-role">${escapeHtml(item.role)}</h4>
              ${item.organization ? `<span class="track-org">${escapeHtml(item.organization)}</span>` : ''}
              ${item.description ? `<p class="track-desc">${escapeHtml(item.description)}</p>` : ''}
            </li>`;

        const trackHtml = (icon, titleKey, list) => `
            <div class="track" data-reveal>
              <h3 class="track-title">${renderIcon(icon)} ${escapeHtml(t(titleKey))}</h3>
              <ol class="track-list">${list.map(itemHtml).join('')}</ol>
            </div>`;

        // La piste "Formation" privilégie about.education, que le dashboard édite
        // (les entrées "formation" de la frise ne sont pas éditées dans le dashboard) ; repli sur celles-ci.
        const work = items.filter((i) => i.type !== 'formation');
        const education = (PORTFOLIO_DATA.about?.education || []).map((e) => ({
            period: e.dates, role: e.degree, organization: e.school, description: e.desc
        }));
        const edu = education.length ? education : items.filter((i) => i.type === 'formation');

        const tracks = [];
        if (work.length) tracks.push(trackHtml('briefcase', 'experience.work', work));
        if (edu.length) tracks.push(trackHtml('graduation', 'experience.edu', edu));

        container.classList.toggle('is-single', tracks.length < 2);
        container.innerHTML = tracks.join('');
        if (hasRendered) container.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in'));
    };

    const renderSkills = () => {
        const container = $('skills-categories-container');
        const iconFor = (name) => (Object.prototype.hasOwnProperty.call(ICONS, name) ? name : 'star');

        const groups = (PORTFOLIO_DATA.skills || []).map((cat) => `
            <div class="skill-group" data-reveal>
              <h3 class="skill-group-title">${renderIcon(iconFor(cat.icon))} ${escapeHtml(cat.category)}</h3>
              <ul class="skill-list">
                ${(cat.items || []).map((item) => {
                    const pct = Math.max(0, Math.min(100, Number(item.percent) || 0));
                    return `
                  <li class="skill">
                    <span class="skill-name">${escapeHtml(item.name)}</span>
                    ${item.level ? `<span class="skill-level mono${pct >= 80 ? ' is-strong' : ''}">${escapeHtml(item.level)}</span>` : ''}
                  </li>`;
                }).join('')}
              </ul>
            </div>`);

        const languages = PORTFOLIO_DATA.cv?.languages || [];
        if (languages.length) {
            groups.push(`
            <div class="skill-group" data-reveal>
              <h3 class="skill-group-title">${renderIcon('translate')} ${escapeHtml(t('skills.languages'))}</h3>
              <ul class="lang-list">${languages.map((l) => `<li class="chip">${escapeHtml(l)}</li>`).join('')}</ul>
            </div>`);
        }

        container.innerHTML = groups.join('');
        // Rang de chaque compétence dans son groupe, pour la cascade d'apparition (CSS)
        container.querySelectorAll('.skill-group').forEach((g) => {
            g.querySelectorAll('.skill, .chip').forEach((item, i) => item.style.setProperty('--i', String(Math.min(i, 8))));
        });
        if (hasRendered) container.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in'));
    };

    const renderContact = () => {
        const c = PORTFOLIO_DATA.contact || {};
        const name = PORTFOLIO_DATA.hero?.name || 'Jordan DIBANGOUP';

        const emailLink = $('contact-email-link');
        emailLink.href = `mailto:${c.email || ''}`;
        emailLink.textContent = c.email || '';
        $('copy-email-btn').hidden = !c.email;

        $('contact-location-text').textContent = c.location || '';
        $('contact-github-link').href = safeUrl(c.github || 'https://github.com/Dibangoup');
        $('contact-linkedin-link').href = safeUrl(c.linkedin || 'https://www.linkedin.com/in/jordan-dibangoup-3373a3375');

        $('footer-copyright').textContent = `© ${new Date().getFullYear()} ${name}. ${t('footer.rights')}`;
    };

    /* ======================================================================
       9. CV : LE PDF ENVOYÉ DEPUIS LE DASHBOARD, AFFICHÉ PAGE PAR PAGE
       ====================================================================== */
    const cvModal = $('cv-modal');
    let cvRenderedUrl = null;

    const renderCv = () => {
        const url = PORTFOLIO_DATA.cv?.pdfUrl || '';
        const content = $('cv-modal-content');
        const download = $('download-pdf-btn');

        download.hidden = !url;
        if (url) download.setAttribute('href', url);

        // Déjà affiché : on garde les pages rendues au lieu de retélécharger le PDF.
        if (url && url === cvRenderedUrl && content.querySelector('canvas')) return;
        cvRenderedUrl = null;

        if (!url) {
            content.innerHTML = `
                <h2 id="cv-name" class="visually-hidden">${escapeHtml(t('cv.title'))}</h2>
                <p class="cv-pdf-status">${escapeHtml(t('cv.unavailable'))}</p>`;
            return;
        }

        content.innerHTML = `
            <h2 id="cv-name" class="visually-hidden">${escapeHtml(t('cv.title'))}</h2>
            <div class="cv-pdf-pages" id="cv-pdf-pages">
              <p class="cv-pdf-status">${escapeHtml(t('cv.loading'))}</p>
            </div>`;
        const pages = $('cv-pdf-pages');

        // Après l'ouverture du dialogue : la largeur réelle sert à dimensionner les pages.
        requestAnimationFrame(() => {
            window.CvViewer.render(pages, url, { label: t('cv.page') })
                .then((count) => { if (count) cvRenderedUrl = url; })
                .catch(() => {
                    pages.innerHTML = `
                        <p class="cv-pdf-status">${escapeHtml(t('cv.error'))}
                          <a href="${escapeHtml(url)}" download>${escapeHtml(t('cv.downloadInstead'))}</a>
                        </p>`;
                });
        });
    };

    const openCv = () => {
        // Le CV prend la place du menu : pas d'animation croisée entre deux dialogues
        closeDialog($('mobile-nav'), { instant: true });
        openDialog(cvModal);
        renderCv();
    };

    document.querySelectorAll('[data-open-cv]').forEach((btn) => btn.addEventListener('click', openCv));

    /* ======================================================================
       10. RENDU GLOBAL
       ====================================================================== */
    const renderAll = () => {
        renderHero();
        renderStack();
        renderProjects();
        renderAbout();
        renderTimeline();
        renderSkills();
        renderContact();
        if (cvModal.open) renderCv();
        observeReveals();
        hasRendered = true;
        // Prévient les modules qui dépendent des données (js/os.js : explorateur, projets, jordan.ts)
        document.dispatchEvent(new CustomEvent('portfolio:rendered'));
    };

    /* ======================================================================
       11. LANGUE
       ====================================================================== */
    const applyLanguage = (lang) => {
        currentLang = lang;
        try { localStorage.setItem('portfolio_lang', lang); } catch { /* ignoré */ }
        root.lang = lang;

        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const value = TRANSLATIONS[lang][el.getAttribute('data-i18n')];
            if (value) el.textContent = value;
        });

        const langBtn = $('lang-toggle');
        langBtn.textContent = lang === 'fr' ? 'EN' : 'FR';
        langBtn.setAttribute('aria-label', t('ui.lang_other'));

        $('project-filters').setAttribute('aria-label', t('projects.filters'));
        $('copy-email-btn').setAttribute('aria-label', t('contact.copy'));
        $('nav-logo').setAttribute('aria-label', t('ui.home'));
        document.querySelectorAll('[data-close-dialog]').forEach((b) => b.setAttribute('aria-label', t('ui.close')));
        updateMenuButton();
        updateThemeButton();
        updateMarqueeButton();
        document.dispatchEvent(new CustomEvent('portfolio:lang', { detail: { lang } }));
    };

    $('lang-toggle').addEventListener('click', () => {
        applyLanguage(currentLang === 'fr' ? 'en' : 'fr');
        renderAll();
        showToast(t('ui.lang_switched'));
    });

    /* ======================================================================
       12. THÈME CLAIR / SOMBRE
       ====================================================================== */
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
    const effectiveTheme = () => root.getAttribute('data-theme') || (systemDark.matches ? 'dark' : 'light');

    function updateThemeButton() {
        const dark = effectiveTheme() === 'dark';
        const btn = $('theme-toggle');
        btn.setAttribute('aria-label', t(dark ? 'ui.theme_light' : 'ui.theme_dark'));
        $('theme-toggle-icon').innerHTML = renderIcon(dark ? 'sun' : 'moon');
    }

    $('theme-toggle').addEventListener('click', (e) => {
        const next = effectiveTheme() === 'dark' ? 'light' : 'dark';
        const apply = () => {
            root.setAttribute('data-theme', next);
            try { localStorage.setItem('portfolio_theme', next); } catch { /* ignoré */ }
            updateThemeButton();
        };
        // Moment rare : le nouveau thème se dévoile en cercle depuis le bouton.
        // Sans View Transitions ou en mouvement réduit, la bascule reste instantanée.
        if (prefersReducedMotion || !document.startViewTransition) return apply();
        const r = e.currentTarget.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const y = r.top + r.height / 2;
        const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
        const vt = document.startViewTransition(apply);
        vt.ready.then(() => {
            root.animate(
                { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
                { duration: 450, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' }
            );
        }).catch(() => { /* transition ignorée : le thème est déjà appliqué */ });
    });

    systemDark.addEventListener('change', updateThemeButton);

    /* ======================================================================
       13. EN-TÊTE : ÉTAT AU DÉFILEMENT, LIEN ACTIF, MENU MOBILE
       ====================================================================== */
    const header = $('site-header');
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => {
            header.classList.toggle('is-scrolled', !entry.isIntersecting);
        }).observe($('top'));

        const navLinks = document.querySelectorAll('.primary-nav .nav-link');
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const id = entry.target.id;
                navLinks.forEach((link) => {
                    if (link.getAttribute('href') === `#${id}`) link.setAttribute('aria-current', 'true');
                    else link.removeAttribute('aria-current');
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        ['hero', 'projects', 'about', 'experience', 'skills', 'contact'].forEach((id) => {
            const el = $(id);
            if (el) sectionObserver.observe(el);
        });
    }

    const mobileNav = $('mobile-nav');
    const menuBtn = $('menu-toggle');

    function updateMenuButton() {
        const open = mobileNav.open;
        menuBtn.setAttribute('aria-expanded', String(open));
        menuBtn.setAttribute('aria-label', t(open ? 'ui.menu_close' : 'ui.menu_open'));
        $('menu-toggle-icon').innerHTML = renderIcon('menu');
    }

    menuBtn.addEventListener('click', () => {
        openDialog(mobileNav);
        updateMenuButton();
    });
    mobileNav.addEventListener('close', updateMenuButton);
    mobileNav.querySelectorAll('.mobile-nav-link').forEach((link) => {
        link.addEventListener('click', () => closeDialog(mobileNav));
    });

    /* ======================================================================
       14. CONTACT : COPIE DE L'E-MAIL ET FORMULAIRE
       ====================================================================== */
    // Confirmation sur place : l'icône « copier » devient une coche, puis revient
    let copyTimer = 0;
    const popIcon = (node) => {
        if (prefersReducedMotion || !node?.animate) return;
        node.animate([{ opacity: 0, transform: 'scale(0.6)' }, { opacity: 1, transform: 'none' }], { duration: 200, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
    };
    const confirmCopy = () => {
        const btn = $('copy-email-btn');
        btn.innerHTML = renderIcon('check');
        btn.classList.add('is-done');
        popIcon(btn.firstElementChild);
        clearTimeout(copyTimer);
        copyTimer = setTimeout(() => {
            btn.innerHTML = renderIcon('copy');
            btn.classList.remove('is-done');
            popIcon(btn.firstElementChild);
        }, 1600);
    };

    $('copy-email-btn').addEventListener('click', async () => {
        const email = PORTFOLIO_DATA.contact?.email || '';
        try {
            await navigator.clipboard.writeText(email);
            showToast(t('copy.ok'), 'success');
            confirmCopy();
        } catch {
            showToast(t('copy.fail'), 'error');
        }
    });

    const contactForm = $('contact-form');
    const fields = ['form-name', 'form-email', 'form-subject', 'form-message-text'];
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const setFieldError = (id, message) => {
        const input = $(id);
        const error = $(`${id}-error`);
        if (message) {
            const appearing = error.hidden;
            input.setAttribute('aria-invalid', 'true');
            error.textContent = message;
            error.hidden = false;
            if (appearing && !prefersReducedMotion && error.animate) {
                error.animate([{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'none' }], { duration: 180, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
            }
        } else {
            input.removeAttribute('aria-invalid');
            error.textContent = '';
            error.hidden = true;
        }
    };

    const validateField = (id) => {
        const value = $(id).value.trim();
        if (!value) return t('form.required');
        if (id === 'form-email' && !emailPattern.test(value)) return t('form.email');
        return '';
    };

    fields.forEach((id) => {
        $(id).addEventListener('blur', () => {
            if ($(id).hasAttribute('aria-invalid')) setFieldError(id, validateField(id));
        });
        $(id).addEventListener('input', () => {
            if ($(id).hasAttribute('aria-invalid') && !validateField(id)) setFieldError(id, '');
        });
    });

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Pièges anti-robots remplis : on simule un succès sans rien envoyer
        const botcheck = contactForm.querySelector('input[name="botcheck"]').checked;
        const gotcha = contactForm.querySelector('input[name="_gotcha"]').value;
        if (botcheck || gotcha.trim() !== '') {
            showToast(t('form.sent'), 'success');
            contactForm.reset();
            return;
        }

        let firstInvalid = null;
        fields.forEach((id) => {
            const message = validateField(id);
            setFieldError(id, message);
            if (message && !firstInvalid) firstInvalid = $(id);
        });
        if (firstInvalid) {
            firstInvalid.focus();
            return;
        }

        const submitBtn = $('contact-submit-btn');
        const originalHtml = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `${renderIcon('sync', 'icon-spin')} <span>${escapeHtml(t('contact.sending'))}</span>`;
        let sent = false;

        fetch('https://api.web3forms.com/submit', { method: 'POST', body: new FormData(contactForm) })
            .then(async (response) => {
                if (response.ok) {
                    showToast(t('form.sent'), 'success');
                    contactForm.reset();
                    sent = true;
                } else {
                    const json = await response.json().catch(() => ({}));
                    showToast(json.message || t('form.error'), 'error');
                }
            })
            .catch(() => showToast(t('form.network'), 'error'))
            .finally(() => {
                const restore = () => {
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('is-sent');
                    submitBtn.innerHTML = originalHtml;
                };
                if (!sent) return restore();
                // Moment rare : le bouton confirme l'envoi pendant 2 s avant de redevenir utilisable
                submitBtn.classList.add('is-sent');
                submitBtn.innerHTML = `${renderIcon('check')} <span>${escapeHtml(t('contact.sent'))}</span>`;
                if (!prefersReducedMotion && submitBtn.animate) {
                    submitBtn.firstElementChild.animate([{ opacity: 0, transform: 'scale(0.6) rotate(-12deg)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(0.34, 1.4, 0.64, 1)' });
                }
                setTimeout(restore, 2000);
            });
    });

    /* ======================================================================
       15. DÉMARRAGE
       ====================================================================== */
    hydrateIcons();
    applyLanguage(currentLang);
    renderAll();

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js').catch(() => { /* échec silencieux */ });
        });
    }

    /* ======================================================================
       16. SYNCHRONISATION EN DIRECT AVEC LE DASHBOARD (événement storage)
       ====================================================================== */
    window.addEventListener('storage', (e) => {
        if (e.key !== 'portfolio_data' || !e.newValue) return;
        try {
            PORTFOLIO_DATA = JSON.parse(e.newValue);
            renderAll();
            showToast(t('ui.live_update'), 'success');
        } catch (err) {
            console.error('Erreur lors de la synchronisation en temps réel', err);
        }
    });
});
