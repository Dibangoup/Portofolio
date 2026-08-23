/* ==========================================================================
   PORTFOLIO ÉTUDIANT - JORDAN DIBANGOUP - SCRIPTS D'INTERACTION DYNAMIQUES
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. CHARGEMENT INITIAL DES DONNÉES DU PORTFOLIO
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

    // Détecte si l'utilisateur a activé l'option de réduction des animations au niveau de son OS
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let revealObserver = null;

    // Échappe les caractères HTML spéciaux pour prévenir toute injection
    const escapeHtml = (str) => String(str ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));

    // Ne laisse passer que les URLs http(s) valides ou relatives sûres
    const safeUrl = (url) => {
        if (!url) return '';
        if (url === '#' || url === '') return '#';
        try {
            const parsed = new URL(url, document.baseURI);
            return (parsed.protocol === 'http:' || parsed.protocol === 'https:') ? parsed.href : '#';
        } catch {
            return '#';
        }
    };

    /* ==========================================================================
       2. SYSTÈME DE NOTIFICATIONS TOAST PREMIUM
       ========================================================================== */
    const toastContainer = document.getElementById('toast-container');
    const showToast = (message, type = 'info') => {
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const iconName = type === 'success' ? 'check' : type === 'error' ? 'error' : 'info';

        toast.innerHTML = `
            ${renderIcon(iconName, 'toast-icon')}
            <div class="toast-message">${escapeHtml(message)}</div>
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
       3. BARRE DE PROGRESSION DE DÉFILEMENT (SCROLL PROGRESS)
       ========================================================================== */
    const scrollProgress = document.getElementById('scroll-progress');
    if (scrollProgress) {
        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
            scrollProgress.style.width = scrolled + '%';
        });
    }

    /* ==========================================================================
       4. CHAMP STELLAIRE INTERACTIF (HERO CANVAS "CARTE CÉLESTE")
       ========================================================================== */
    function initHeroCanvas() {
        const canvas = document.getElementById('hero-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const heroEl = document.getElementById('hero');
        let width = 0, height = 0;
        let stars = [];
        const mouse = { x: null, y: null };
        const maxDist = 95;
        const mouseDist = 130;

        function resize() {
            if (!heroEl) return;
            const rect = heroEl.getBoundingClientRect();
            width = canvas.width = rect.width;
            height = canvas.height = rect.height;
            createStars();
        }

        function createStars() {
            const count = Math.min(80, Math.floor((width * height) / 14000));
            stars = [];
            for (let i = 0; i < count; i++) {
                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.28,
                    vy: (Math.random() - 0.5) * 0.28,
                    r: Math.random() * 1.3 + 0.5
                });
            }
        }

        heroEl.addEventListener('mousemove', (e) => {
            const rect = heroEl.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        heroEl.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        function drawFrame() {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];
                if (!prefersReducedMotion) {
                    s.x += s.vx;
                    s.y += s.vy;
                    if (s.x < 0) s.x = width;
                    if (s.x > width) s.x = 0;
                    if (s.y < 0) s.y = height;
                    if (s.y > height) s.y = 0;
                }

                for (let j = i + 1; j < stars.length; j++) {
                    const s2 = stars[j];
                    const dx = s.x - s2.x, dy = s.y - s2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < maxDist) {
                        ctx.strokeStyle = `rgba(243,241,232,${0.28 * (1 - dist / maxDist)})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(s.x, s.y);
                        ctx.lineTo(s2.x, s2.y);
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
       5. MODALE INTERACTIVE DES DÉTAILS DE PROJET (ÉTUDE DE CAS)
       ========================================================================== */
    const projectModal = document.getElementById('project-modal');
    const closeProjectBtn = document.getElementById('close-project-modal');
    const projectModalContent = document.getElementById('project-modal-content');
    
    const openProjectModal = (projectId) => {
        const data = PROJECTS_DATA[projectId];
        if (!data || !projectModal || !projectModalContent) return;

        const techBadges = (data.tech || []).map(t => `<span class="tech-pill">${escapeHtml(t)}</span>`).join('');

        const featuresList = (data.features || []).map(f => `
            <li>${renderIcon('check')}<span>${escapeHtml(f)}</span></li>
        `).join('');

        const hasDemo = data.demo && data.demo !== '#' && data.demo !== '';
        const hasSource = data.source && data.source !== '#' && data.source !== '';

        const links = `
            ${hasDemo ? `<a href="${escapeHtml(safeUrl(data.demo))}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">${renderIcon('link')} Accéder au projet</a>` : ''}
            ${hasSource ? `<a href="${escapeHtml(safeUrl(data.source))}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost">${renderIcon('code')} Code source</a>` : ''}
        `;

        projectModalContent.innerHTML = `
            <article class="article-sheet">
                <div class="article-image">
                    <img src="${escapeHtml(safeUrl(data.image))}" alt="${escapeHtml(data.title)}">
                </div>
                <div class="flex items-center justify-between gap-2 mt-2">
                    <span class="stop-cat">${escapeHtml(data.categoryLabel)}</span>
                    ${data.status ? `<span class="skill-level-badge">${escapeHtml(data.status)}</span>` : ''}
                </div>
                <h2 class="article-title">${escapeHtml(data.title)}</h2>
                <div class="tech-row">${techBadges}</div>
                <p class="article-desc">${escapeHtml(data.description)}</p>

                <div class="project-modal-grid">
                    ${data.context ? `
                    <div class="project-modal-block">
                        <h4>${renderIcon('target')} Contexte &amp; Problématique</h4>
                        <p>${escapeHtml(data.context)}</p>
                    </div>
                    ` : ''}
                    ${data.architecture ? `
                    <div class="project-modal-block">
                        <h4>${renderIcon('terminal')} Architecture &amp; Choix Techniques</h4>
                        <p>${escapeHtml(data.architecture)}</p>
                    </div>
                    ` : ''}
                </div>

                <div class="article-brief">
                    <h4>Fonctionnalités Clés</h4>
                    <ul>${featuresList}</ul>
                </div>
                ${(hasDemo || hasSource) ? `<div class="article-links">${links}</div>` : ''}
            </article>
        `;

        projectModal.classList.add('active');
        projectModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };
    
    const closeProjectModal = () => {
        if (!projectModal) return;
        projectModal.classList.remove('active');
        projectModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = 'auto';
    };
    
    if (closeProjectBtn) closeProjectBtn.addEventListener('click', closeProjectModal);
    if (projectModal) {
        projectModal.addEventListener('click', (e) => {
            if (e.target === projectModal) closeProjectModal();
        });
    }
    
    /* ==========================================================================
       6. FONCTIONS DE RENDU DYNAMIQUE DU PORTFOLIO
       ========================================================================== */
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
            nameSpan.textContent = h.name || 'Jordan DIBANGOUP';
            const dot = document.createElement('span');
            dot.className = 'nav-logo-dot';
            logoEl.appendChild(nameSpan);
            logoEl.appendChild(dot);
        }

        document.title = `${h.name || 'Jordan DIBANGOUP'} | Portfolio Développeur Full-Stack & Génie Logiciel`;
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
            const skillItemsHtml = cat.items.map(item => {
                const levelBadge = item.level 
                    ? `<span class="skill-level-badge">${escapeHtml(item.level)}</span>`
                    : `<span class="skill-percent">${escapeHtml(String(item.percent))}%</span>`;

                return `
                    <div class="skill-row">
                      <div class="skill-row-top">
                        <span class="font-semibold">${escapeHtml(item.name)}</span>
                        ${levelBadge}
                      </div>
                      <div class="skill-fill-track">
                        <div class="skill-bar-fill" data-percent="${escapeHtml(String(item.percent))}"></div>
                      </div>
                    </div>
                `;
            }).join('');

            return `
                <div class="skill-legend-col">
                  <h3>${renderIcon(iconFor(cat.icon))} ${escapeHtml(cat.category)}</h3>
                  ${skillItemsHtml}
                </div>
            `;
        }).join('');

        triggerSkillsAnimation();
    };

    const renderTimeline = () => {
        const container = document.getElementById('timeline-container');
        if (!container) return;

        let items = PORTFOLIO_DATA.timeline;
        if (!items || items.length === 0) {
            // Fallback automatique avec les données du CV
            items = [];
            if (PORTFOLIO_DATA.cv?.experiences) {
                PORTFOLIO_DATA.cv.experiences.forEach(exp => {
                    items.push({
                        period: exp.dates,
                        role: exp.role,
                        organization: exp.company,
                        description: exp.description
                    });
                });
            }
            if (PORTFOLIO_DATA.about?.education) {
                PORTFOLIO_DATA.about.education.forEach(edu => {
                    items.push({
                        period: edu.dates,
                        role: edu.degree,
                        organization: edu.school,
                        description: edu.desc || ''
                    });
                });
            }
        }

        container.innerHTML = items.map(item => `
            <div class="tl-item">
                <span class="tl-date mono">${escapeHtml(item.period || item.dates)}</span>
                <div>
                    <div class="tl-title">${escapeHtml(item.role || item.degree)}</div>
                    <p class="tl-desc"><strong>${escapeHtml(item.organization || item.company || item.school)}</strong> — ${escapeHtml(item.description || item.desc || '')}</p>
                </div>
            </div>
        `).join('');
    };

    const renderProjects = () => {
        const grid = document.getElementById('projects-grid');
        if (!grid || !PORTFOLIO_DATA.projects) return;

        grid.innerHTML = PORTFOLIO_DATA.projects.map(proj => {
            const hasDemo = proj.demo && proj.demo !== '#' && proj.demo !== '';
            const hasSource = proj.source && proj.source !== '#' && proj.source !== '';

            return `
              <article class="stop-card relative" data-category="${escapeHtml(proj.category)}" data-project-id="${escapeHtml(proj.id)}">
                ${proj.status ? `<span class="stop-status-badge">${escapeHtml(proj.status)}</span>` : ''}
                <div class="stop-viewport">
                  <img alt="${escapeHtml(proj.cardTitle)}" src="${escapeHtml(safeUrl(proj.image))}" />
                </div>
                <div class="stop-body">
                  <span class="stop-cat">${escapeHtml(proj.categoryLabel)}</span>
                  <h3 class="project-title">${escapeHtml(proj.cardTitle)}</h3>
                  <p>${escapeHtml(proj.shortDescription)}</p>
                  <div class="tech-row">
                    ${(proj.tech || []).slice(0, 4).map(t => `<span class="tech-pill">${escapeHtml(t)}</span>`).join('')}
                  </div>
                  ${(hasDemo || hasSource) ? `
                  <div class="stop-links">
                    ${hasDemo ? `<a href="${escapeHtml(safeUrl(proj.demo))}" target="_blank" rel="noopener noreferrer" class="external-link">${renderIcon('link')} Démo</a>` : ''}
                    ${hasSource ? `<a href="${escapeHtml(safeUrl(proj.source))}" target="_blank" rel="noopener noreferrer" class="external-link">${renderIcon('code')} Code</a>` : ''}
                  </div>
                  ` : ''}
                </div>
              </article>
            `;
        }).join('');

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
                entries.forEach((entry) => {
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
            emailLink.href = `mailto:${c.email}`;
            emailLink.textContent = c.email;
        }
        
        const locText = document.getElementById('contact-location-text');
        if (locText) locText.textContent = c.location;
        
        const githubLink = document.getElementById('contact-github-link');
        if (githubLink) githubLink.href = c.github || 'https://github.com/Dibangoup';
        
        const linkedinLink = document.getElementById('contact-linkedin-link');
        if (linkedinLink) linkedinLink.href = c.linkedin || 'https://www.linkedin.com/in/jordan-dibangoup-3373a3375';
        
        const footerLogo = document.getElementById('footer-logo');
        if (footerLogo) footerLogo.textContent = PORTFOLIO_DATA.hero?.name || 'Jordan DIBANGOUP';
        
        const footerCopyright = document.getElementById('footer-copyright');
        if (footerCopyright) {
            footerCopyright.textContent = `© 2026 ${PORTFOLIO_DATA.hero?.name || 'Jordan DIBANGOUP'}. Conçu avec Précision & Clarté.`;
        }
    };

    const renderAll = () => {
        PROJECTS_DATA = getProjectsDataObject();
        renderHero();
        renderAbout();
        renderSkills();
        renderTimeline();
        renderProjects();
        renderContact();
        
        if (typeof revealObserver !== 'undefined' && revealObserver) {
            document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
        }
    };

    // Premier rendu au chargement de la page
    renderAll();

    /* ==========================================================================
       7. VISUALISEUR DE CV INTERACTIF & EXPORT PDF
       ========================================================================== */
    const cvModal = document.getElementById('cv-modal');
    const closeCvBtn = document.getElementById('close-cv-modal');
    const cvModalContent = document.getElementById('cv-modal-content');
    const cvBtn = document.getElementById('cv-btn');
    const heroCvBtn = document.getElementById('hero-cv-btn');
    const mobileCvBtn = document.getElementById('mobile-cv-btn');
    
    const openCvModal = () => {
        if (!cvModal || !cvModalContent) return;

        const cv = PORTFOLIO_DATA.cv;
        if (!cv) return;

        const skillsBadges = (cv.skills || []).map(s => `<span class="tech-pill">${escapeHtml(s)}</span>`).join('');
        const languagesList = (cv.languages || []).map(l => `<li>${escapeHtml(l)}</li>`).join('');

        const experiencesList = (cv.experiences || []).map(exp => `
            <div class="cv-entry">
                <div class="cv-entry-top">
                    <h5>${escapeHtml(exp.role)}</h5>
                    <span class="mono">${escapeHtml(exp.dates)}</span>
                </div>
                <span class="cv-entry-org">${escapeHtml(exp.company)}</span>
                <p>${escapeHtml(exp.description)}</p>
            </div>
        `).join('');

        const formationsList = (cv.formations || []).map(f => `
            <div class="cv-entry">
                <div class="cv-entry-top">
                    <h5>${escapeHtml(f.degree)}</h5>
                    <span class="mono">${escapeHtml(f.dates)}</span>
                </div>
                <span class="cv-entry-org">${escapeHtml(f.school)}</span>
            </div>
        `).join('');

        cvModalContent.innerHTML = `
            <div class="cv-sheet" id="printable-cv">
                <div class="cv-header">
                    <div>
                        <h2>${escapeHtml(cv.identity.name)}</h2>
                        <p class="cv-role">${escapeHtml(cv.identity.role)}</p>
                        <p class="cv-availability">${escapeHtml(cv.identity.availability)}</p>
                    </div>
                    <button class="btn btn-primary" id="download-pdf-btn">${renderIcon('download')} Télécharger / Imprimer le CV (PDF)</button>
                </div>

                <div class="cv-grid">
                    <div class="cv-col">
                        <h4>Contact</h4>
                        <ul class="cv-contact-list">
                            <li>${renderIcon('mail')} ${escapeHtml(cv.contact.email)}</li>
                            <li>${renderIcon('phone')} ${escapeHtml(cv.contact.phone)}</li>
                            <li>${renderIcon('location')} ${escapeHtml(cv.contact.location)}</li>
                        </ul>
                        <h4>Compétences Clés</h4>
                        <div class="tech-row">${skillsBadges}</div>
                        <h4>Langues</h4>
                        <ul class="cv-lang-list">${languagesList}</ul>
                    </div>
                    <div class="cv-col cv-col-wide">
                        <h4>Expériences Professionnelles</h4>
                        <div class="cv-entries">${experiencesList}</div>
                        <h4>Formations &amp; Diplômes</h4>
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
                showToast("Ouverture de l'aperçu avant impression / enregistrement PDF... 📄", "info");
                setTimeout(() => {
                    window.print();
                }, 350);
            });
        }
    };
    
    const closeCvModal = () => {
        if (!cvModal) return;
        cvModal.classList.remove('active');
        cvModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = 'auto';
    };
    
    if (cvBtn) cvBtn.addEventListener('click', openCvModal);
    if (heroCvBtn) heroCvBtn.addEventListener('click', openCvModal);
    if (mobileCvBtn) mobileCvBtn.addEventListener('click', () => {
        const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
        if (mobileNavOverlay) mobileNavOverlay.classList.remove('active');
        openCvModal();
    });
    if (closeCvBtn) closeCvBtn.addEventListener('click', closeCvModal);
    if (cvModal) {
        cvModal.addEventListener('click', (e) => {
            if (e.target === cvModal) closeCvModal();
        });
    }

    /* ==========================================================================
       8. ANIMATIONS AU SCROLL (SCROLL REVEAL)
       ========================================================================== */
    if (!prefersReducedMotion) {
        const revealObserverOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, revealObserverOptions);

        document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
    } else {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
    }

    /* ==========================================================================
       9. EFFET SHRINK DE LA NAVBAR AU SCROLL
       ========================================================================== */
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('h-16', window.scrollY > 40);
        });
    }

    /* ==========================================================================
       10. ONGLETS DE PRÉSENTATION (ABOUT SECTION)
       ========================================================================== */
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
       11. ANIMATION DES BARRES DE COMPÉTENCES TECHNIQUES
       ========================================================================== */
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
       12. FILTRAGE DES PROJETS
       ========================================================================== */
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
       13. MENU MOBILE OVERLAY
       ========================================================================== */
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
       14. FORMULAIRE DE CONTACT
       ========================================================================== */
    const contactForm = document.getElementById('contact-form');
    const contactSubmitIcon = document.getElementById('contact-submit-icon');
    if (contactSubmitIcon) contactSubmitIcon.innerHTML = renderIcon('send');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('form-name').value.trim();
            const email = document.getElementById('form-email').value.trim();
            const subject = document.getElementById('form-subject').value.trim();
            const message = document.getElementById('form-message-text').value.trim();

            // Vérification Honeypot anti-bot
            const botcheck = contactForm.querySelector('input[name="botcheck"]')?.checked;
            const gotcha = contactForm.querySelector('input[name="_gotcha"]')?.value;
            if (botcheck || (gotcha && gotcha.trim() !== '')) {
                showToast('Votre message a bien été envoyé ! Je vous répondrai très vite. ✉️', 'success');
                contactForm.reset();
                return;
            }

            if (!name || !email || !subject || !message) {
                showToast('Veuillez remplir tous les champs obligatoires.', 'error');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showToast('Veuillez saisir une adresse e-mail valide.', 'error');
                return;
            }

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.innerHTML = `${renderIcon('sync', 'icon-spin')} Envoi en cours...`;

            const formData = new FormData(contactForm);

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            })
            .then(async (response) => {
                if (response.status === 200) {
                    showToast('Votre message a bien été envoyé ! Je vous répondrai très vite. ✉️', 'success');
                    contactForm.reset(); 
                } else {
                    const json = await response.json();
                    showToast(json.message || "Une erreur est survenue lors de l'envoi.", 'error');
                }
            })
            .catch(() => {
                showToast("Impossible de joindre le serveur. Vérifiez votre connexion.", 'error');
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            });
        });
    }

    /* ==========================================================================
       15. SUPPORT BILINGUE (FR / EN)
       ========================================================================== */
    const TRANSLATIONS = {
        fr: {
            'nav.about': 'À Propos',
            'nav.skills': 'Compétences',
            'nav.experience': 'Parcours',
            'nav.projects': 'Projets',
            'nav.contact': 'Contact',
            'nav.cv': 'Mon CV',
            'hero.cta_projects': 'Voir mes projets',
            'hero.cta_contact': 'Contact',
            'hero.cta_cv': '📄 CV',
            'hero.tag': 'Point de départ',
            'about.eyebrow': 'À propos',
            'about.title': 'Le chemin parcouru',
            'about.sub': 'Du baccalauréat scientifique à la licence en Génie Logiciel, les grandes étapes de ma formation.',
            'about.tab_story': 'Mon Histoire',
            'about.tab_edu': 'Études',
            'about.tab_values': 'Valeurs',
            'skills.eyebrow': 'Compétences',
            'skills.title': 'Compétences techniques & Ingénierie',
            'skills.sub': 'Niveau de maîtrise opérationnel structuré par domaine d\'expertise logicielle.',
            'experience.eyebrow': 'Parcours',
            'experience.title': 'Expériences & Formation Académique',
            'experience.sub': 'Historique de mes expériences pratiques, projets académiques et parcours en Génie Logiciel.',
            'projects.eyebrow': 'Réalisations',
            'projects.title': 'Étapes & Projets Réalisés',
            'projects.sub': 'Une sélection de réalisations complètes, du développement web full-stack aux applications mobiles.',
            'projects.filter_all': 'Tous',
            'projects.filter_web': 'Web Full-Stack',
            'projects.filter_mobile': 'Applications Mobiles',
            'contact.eyebrow': 'Contact',
            'contact.title': 'Prochaine destination',
            'contact.sub': 'Un projet, une proposition de stage ou une question technique ? Écrivez-moi directement.',
            'contact.location_key': 'Lieu',
            'contact.label_name': 'Nom complet *',
            'contact.label_email': 'Adresse e-mail *',
            'contact.label_subject': 'Sujet *',
            'contact.label_message': 'Votre message *',
            'contact.btn_send': 'Envoyer le message'
        },
        en: {
            'nav.about': 'About',
            'nav.skills': 'Skills',
            'nav.experience': 'Journey',
            'nav.projects': 'Projects',
            'nav.contact': 'Contact',
            'nav.cv': 'Resume',
            'hero.cta_projects': 'View my projects',
            'hero.cta_contact': 'Get in touch',
            'hero.cta_cv': '📄 Resume',
            'hero.tag': 'Starting point',
            'about.eyebrow': 'About me',
            'about.title': 'The Journey So Far',
            'about.sub': 'From scientific high school to Software Engineering degree, key milestones of my education.',
            'about.tab_story': 'My Story',
            'about.tab_edu': 'Education',
            'about.tab_values': 'Values',
            'skills.eyebrow': 'Skills',
            'skills.title': 'Technical Skills & Engineering',
            'skills.sub': 'Operational proficiency level structured by software engineering domain.',
            'experience.eyebrow': 'Journey',
            'experience.title': 'Experience & Academic Background',
            'experience.sub': 'Track record of practical internships, academic projects, and software engineering studies.',
            'projects.eyebrow': 'Portfolio',
            'projects.title': 'Featured Projects & Milestones',
            'projects.sub': 'A selection of full-stack web applications and mobile projects.',
            'projects.filter_all': 'All',
            'projects.filter_web': 'Full-Stack Web',
            'projects.filter_mobile': 'Mobile Apps',
            'contact.eyebrow': 'Contact',
            'contact.title': 'Get In Touch',
            'contact.sub': 'Have an internship opportunity, project or inquiry? Reach out directly.',
            'contact.location_key': 'Location',
            'contact.label_name': 'Full name *',
            'contact.label_email': 'Email address *',
            'contact.label_subject': 'Subject *',
            'contact.label_message': 'Your message *',
            'contact.btn_send': 'Send Message'
        }
    };

    let currentLang = localStorage.getItem('portfolio_lang') || 'fr';

    const applyLanguage = (lang) => {
        currentLang = lang;
        localStorage.setItem('portfolio_lang', lang);
        document.documentElement.lang = lang;

        const langBtn = document.getElementById('lang-toggle');
        if (langBtn) {
            langBtn.textContent = lang === 'fr' ? 'EN' : 'FR';
            langBtn.title = lang === 'fr' ? 'Switch to English' : 'Passer en Français';
        }

        const dict = TRANSLATIONS[lang] || TRANSLATIONS.fr;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) {
                el.textContent = dict[key];
            }
        });
    };

    const langToggleBtn = document.getElementById('lang-toggle');
    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', () => {
            const newLang = currentLang === 'fr' ? 'en' : 'fr';
            applyLanguage(newLang);
            showToast(newLang === 'fr' ? 'Langue changée en Français' : 'Language switched to English', 'info');
        });
    }

    // Applique la langue sauvegardée
    if (currentLang !== 'fr') {
        applyLanguage(currentLang);
    }

    /* ==========================================================================
       16. ENREGISTREMENT PWA / SERVICE WORKER
       ========================================================================== */
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(() => {
                    // Service worker enregistré avec succès
                })
                .catch(() => {
                    // Échec silencieux
                });
        });
    }

    /* ==========================================================================
       17. SYNCHRONISATION DASHBOARD EN TEMPS RÉEL (storage event)
       ========================================================================== */
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
