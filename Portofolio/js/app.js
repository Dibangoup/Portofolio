/* ==========================================================================
   PORTFOLIO ÉTUDIANT - SCRIPTS D'INTERACTION DYNAMIQUES
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. CHARGEMENT INITIAL DES DONNÉES DU PORTFOLIO
    // Le fichier js/portfolio-data.js (écrit sur le disque par le serveur) est la
    // source de vérité. localStorage n'est utilisé que pour la prévisualisation
    // en direct entre onglets pendant une session d'édition (voir l'écouteur 'storage'
    // plus bas), jamais pour écraser les données du disque au chargement.
    PORTFOLIO_DATA = DEFAULT_PORTFOLIO_DATA;

    // Reconstruction de PROJECTS_DATA à partir du tableau PORTFOLIO_DATA.projects
    const getProjectsDataObject = () => {
        const obj = {};
        if (PORTFOLIO_DATA.projects) {
            PORTFOLIO_DATA.projects.forEach(p => {
                obj[p.id] = p;
            });
        }
        return obj;
    };
    let PROJECTS_DATA = getProjectsDataObject();

    // Détecte si l'utilisateur a activé l'option de réduction des animations au niveau de son OS (accessibilité)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
            return (parsed.protocol === 'http:' || parsed.protocol === 'https:') ? parsed.href : '#';
        } catch {
            return '#';
        }
    };

    /* ==========================================================================
       2. SYSTÈME DE NOTIFICATIONS TOAST PREMIUM
       ========================================================================== 
       Permet d'afficher de magnifiques petites notifications flottantes en bas à droite
       de l'écran pour informer l'utilisateur (succès d'envoi de formulaire, téléchargements, etc.).
       
       Utilisation : showToast("Votre message", "success" | "error" | "info");
    */
    const toastContainer = document.getElementById('toast-container');
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

    /* ==========================================================================
       3. THÈME UNIQUE (aucune bascule clair/sombre)
       ==========================================================================
       Le site n'a qu'un seul thème (nuit/or, défini par les tokens CSS de
       glass.css) : aucune classe 'light'/'dark' n'est nécessaire sur <html>.
       Nettoie toute ancienne préférence enregistrée par une version antérieure.
    */
    localStorage.removeItem('theme');

    /* ==========================================================================
       4. BARRE DE PROGRESSION DE DÉFILEMENT (SCROLL PROGRESS)
       ========================================================================== 
       Calcule le défilement de l'utilisateur dans la page et met à jour en temps réel
       la largeur de la fine ligne colorée fixée sous la barre de navigation.
    */
    const scrollProgress = document.getElementById('scroll-progress');
    if (scrollProgress) {
        window.addEventListener('scroll', () => {
            // Position actuelle du scroll (haut de la page)
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            // Hauteur totale scrollable de la page moins la hauteur de la fenêtre active
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            // Calcul du pourcentage de lecture
            const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
            // Met à jour la largeur de la barre de progression en CSS
            scrollProgress.style.width = `${scrolled}%`;
        });
    }

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
            drawFrame();
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

        let rafId;
        function loop() { drawFrame(); rafId = requestAnimationFrame(loop); }

        resize();
        window.addEventListener('resize', resize);

        if (prefersReducedMotion) {
            drawFrame();
        } else {
            let heroVisible = true;
            const heroIO = new IntersectionObserver((entries) => {
                heroVisible = entries[0].isIntersecting;
                if (heroVisible && !prefersReducedMotion) {
                    loop();
                } else if (rafId) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                }
            });
            heroIO.observe(heroEl);
        }
    }
    initHeroCanvas();

    /* ==========================================================================
       6. MODALE INTERACTIVE DES DÉTAILS DE PROJET
       ========================================================================== 
       Gère l'ouverture, l'injection dynamique du contenu HTML à partir de la base de données
       (PROJECTS_DATA) et la fermeture propre de la fenêtre modale de détails.
    */
    const projectModal = document.getElementById('project-modal');
    const closeProjectBtn = document.getElementById('close-project-modal');
    const projectModalContent = document.getElementById('project-modal-content');
    
    const openProjectModal = (projectId) => {
        const data = PROJECTS_DATA[projectId];
        if (!data || !projectModal || !projectModalContent) return;

        const techBadges = data.tech.map(t => `<span class="tech-pill">${escapeHtml(t)}</span>`).join('');

        const featuresList = data.features.map(f => `
            <li>${renderIcon('check')}<span>${escapeHtml(f)}</span></li>
        `).join('');

        const links = `
            ${data.demo !== '#' ? `<a href="${escapeHtml(safeUrl(data.demo))}" target="_blank" rel="noopener" class="btn btn-primary">${renderIcon('link')} Voir la démo</a>` : ''}
            ${data.source !== '#' ? `<a href="${escapeHtml(safeUrl(data.source))}" target="_blank" rel="noopener" class="btn btn-ghost">${renderIcon('code')} Code source</a>` : ''}
        `;

        projectModalContent.innerHTML = `
            <article class="article-sheet">
                <div class="article-image">
                    <img src="${escapeHtml(safeUrl(data.image))}" alt="${escapeHtml(data.title)}">
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
    
    // Fonction de fermeture de la modale
    const closeProjectModal = () => {
        if (!projectModal) return;
        projectModal.classList.remove('active');
        projectModal.setAttribute('aria-hidden', 'true');
        // Restaure le défilement de la page arrière-plan
        document.body.style.overflow = 'auto';
    };
    
    // Écouteurs de clics pour fermer la modale (via bouton X ou clic à l'extérieur)
    if (closeProjectBtn) closeProjectBtn.addEventListener('click', closeProjectModal);
    if (projectModal) {
        projectModal.addEventListener('click', (e) => {
            if (e.target === projectModal) closeProjectModal();
        });
    }
    
    // FONCTIONS DE RENDU DYNAMIQUE DU PORTFOLIO
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

    const renderAbout = () => {
        const a = PORTFOLIO_DATA.about;
        if (!a) return;

        const titleEl = document.getElementById('about-story-title');
        if (titleEl) titleEl.textContent = a.title || '';

        const paragraphsEl = document.getElementById('about-paragraphs');
        if (paragraphsEl && a.paragraphs) {
            paragraphsEl.innerHTML = a.paragraphs.map(p =>
                `<p class="flowing-text">${escapeHtml(p)}</p>`
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
    };

    const renderSkills = () => {
        const container = document.getElementById('skills-categories-container');
        if (!container || !PORTFOLIO_DATA.skills) return;

        const iconFor = (name) => (ICONS[name] ? name : 'star');

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

        triggerSkillsAnimation();
    };

    const renderProjects = () => {
        const grid = document.getElementById('projects-grid');
        if (!grid || !PORTFOLIO_DATA.projects) return;

        grid.innerHTML = PORTFOLIO_DATA.projects.map(proj => `
          <article class="stop-card" data-category="${escapeHtml(proj.category)}" data-project-id="${escapeHtml(proj.id)}">
            <div class="stop-viewport">
              <img alt="${escapeHtml(proj.cardTitle)}" src="${escapeHtml(safeUrl(proj.image))}" />
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
                ${proj.demo !== '#' ? `<a href="${escapeHtml(safeUrl(proj.demo))}" target="_blank" rel="noopener" class="external-link">${renderIcon('link')} Démo</a>` : ''}
                ${proj.source !== '#' ? `<a href="${escapeHtml(safeUrl(proj.source))}" target="_blank" rel="noopener" class="external-link">${renderIcon('code')} Code</a>` : ''}
              </div>
              ` : ''}
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
                        const delay = prefersReducedMotion ? 0 : Array.prototype.indexOf.call(revealCards, entry.target) * 70;
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

    const renderAll = () => {
        PROJECTS_DATA = getProjectsDataObject(); // Met à jour l'objet projets pour les modales
        renderHero();
        renderAbout();
        renderSkills();
        renderProjects();
        renderContact();
        
        // Ré-attacher l'observateur d'apparitions pour les nouveaux éléments
        if (typeof revealObserver !== 'undefined' && revealObserver) {
            document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
        }
    };

    // Premier rendu au chargement de la page
    renderAll();

    /* ==========================================================================
       7. VISUALISEUR DE CV INTERACTIF (À PERSONNALISER POUR VOTRE CV)
       ========================================================================== 
       Permet d'ouvrir une superbe maquette interactive de votre CV papier au clic
       sur le bouton "Mon CV" avec une simulation animée de téléchargement PDF.
    */
    const cvModal = document.getElementById('cv-modal');
    const closeCvBtn = document.getElementById('close-cv-modal');
    const cvModalContent = document.getElementById('cv-modal-content');
    const cvBtn = document.getElementById('cv-btn');
    
    // Ouvre la modale de CV et y injecte votre structure de CV complète
    const openCvModal = () => {
        if (!cvModal || !cvModalContent) return;

        const cv = PORTFOLIO_DATA.cv;
        if (!cv) return;

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
    
    // Fermeture du CV modale
    const closeCvModal = () => {
        if (!cvModal) return;
        cvModal.classList.remove('active');
        cvModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = 'auto';
    };
    
    // Attache les événements de clic sur les boutons d'ouverture et de fermeture du CV
    if (cvBtn) cvBtn.addEventListener('click', openCvModal);
    if (closeCvBtn) closeCvBtn.addEventListener('click', closeCvModal);
    if (cvModal) {
        cvModal.addEventListener('click', (e) => {
            if (e.target === cvModal) closeCvModal();
        });
    }

    /* ==========================================================================
       8. ANIMATIONS AU SCROLL (SCROLL REVEAL)
       ========================================================================== 
       Utilise l'API moderne IntersectionObserver pour détecter l'affichage des sections
       à l'écran et leur appliquer une transition d'apparition en fondu glissant.
    */
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
        // Si l'utilisateur préfère réduire les animations, on active directement tous les éléments
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
    }

    /* ==========================================================================
       10. EFFET SHRINK DE LA NAVBAR AU SCROLL
       ========================================================================== 
       Réduit légèrement la hauteur de la barre de navigation et lui ajoute une
       ombre subtile dès que l'utilisateur commence à faire défiler la page.
    */
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('h-16', window.scrollY > 40);
        });
    }

    /* ==========================================================================
       11. ONGLETS DE PRÉSENTATION INTERACTIFS (ABOUT SECTION)
       ========================================================================== 
       Gère le basculement fluide entre les différents onglets de la section "À Propos"
       ("Mon Histoire", "Mes Études", "Mes Valeurs").
    */
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

    /* ==========================================================================
       12. ANIMATION DES BARRES DE COMPÉTENCES TECHNIQUES
       ========================================================================== 
       Anime la jauge de remplissage des barres de progression jusqu'à la valeur
       indiquée dans l'attribut data-percent uniquement lorsque la section apparaît à l'écran.
    */
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

    /* ==========================================================================
       15. FORMULAIRE DE CONTACT & VALIDATION CÔTÉ CLIENT
       ========================================================================== 
       Valide les formats de saisie utilisateur et simule un envoi réseau asynchrone 
       avec retour d'information par le biais du système de toasts personnalisés.
    */
    const contactForm = document.getElementById('contact-form');
    const contactSubmitIcon = document.getElementById('contact-submit-icon');
    if (contactSubmitIcon) contactSubmitIcon.innerHTML = renderIcon('send');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Récupération des valeurs saisies sans espaces inutiles
            const name = document.getElementById('form-name').value.trim();
            const email = document.getElementById('form-email').value.trim();
            const subject = document.getElementById('form-subject').value.trim();
            const message = document.getElementById('form-message-text').value.trim();

            // Validation de la présence de tous les champs requis
            if (!name || !email || !subject || !message) {
                showToast('Veuillez remplir tous les champs obligatoires.', 'error');
                return;
            }

            // Expression régulière pour la validation de base de l'adresse e-mail
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showToast('Veuillez saisir une adresse e-mail valide.', 'error');
                return;
            }

            // Désactivation du bouton de soumission et animation du spinner pendant l'envoi
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.innerHTML = `${renderIcon('sync', 'icon-spin')} Envoi en cours...`;

           // 5. Préparation des données (inclut automatiquement la clé access_key cachée en HTML)
            const formData = new FormData(contactForm);

            // 6. Envoi à l'API Web3Forms
            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            })
            .then(async (response) => {
                if (response.status === 200) {
                    // Succès
                    showToast('Votre message a bien été envoyé ! Je vous répondrai sous 24h. ✉️', 'success');
                    contactForm.reset(); 
                } else {
                    // Erreur API
                    const json = await response.json();
                    showToast(json.message || "Une erreur est survenue lors de l'envoi.", 'error');
                }
            })
            .catch(error => {
                // Erreur réseau (ex: pas d'internet)
                showToast("Impossible de joindre le serveur. Vérifiez votre connexion.", 'error');
            })
            .finally(() => {
                // Dans tous les cas (succès ou échec), on réactive le bouton
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText; // Restaure le texte et l'icône du bouton
            });
        });
    }

    /* ==========================================================================
       16. ÉCOUTE DES MODIFICATIONS DU DASHBOARD EN TEMPS RÉEL (storage event)
       ========================================================================== 
       Permet de mettre à jour le portfolio en temps réel sans rechargement de page
       lorsque l'utilisateur valide ses changements dans l'admin dashboard.
    */
    window.addEventListener('storage', (e) => {
        if (e.key === 'portfolio_data') {
            try {
                PORTFOLIO_DATA = JSON.parse(e.newValue);
                renderAll();
                showToast("Portfolio mis à jour en temps réel ! ⚡", "success");
            } catch (err) {
                console.error("Erreur lors de la synchronisation en temps réel", err);
            }
        }
    });
});
