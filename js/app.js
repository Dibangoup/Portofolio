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
        
        // Création de la carte de notification HTML
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
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

    /* ==========================================================================
       3. FORÇAGE DU MODE CLAIR UNIQUEMENT (DESACTIVATION DU MODE SOMBRE)
       ========================================================================== 
       Cette section assure que le site s'exécute toujours avec le thème clair d'origine.
       Elle nettoie également les anciennes préférences enregistrées pour éviter les conflits.
    */
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
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
       5. HALO LUMINEUX DE SOURIS (MOUSE GLOW)
       ========================================================================== 
       Fait suivre une lueur dégradée douce derrière le curseur de la souris dans 
       la section Hero principale, créant un effet d'éclairage interactif haut de gamme.
    */
    const heroSection = document.getElementById('hero');
    const mouseGlow = document.getElementById('mouse-glow');
    
    // N'exécute l'effet que sur les ordinateurs et si l'utilisateur n'a pas désactivé les animations
    if (heroSection && mouseGlow && !prefersReducedMotion) {
        // Affiche la lueur lorsque la souris entre dans la zone Hero
        heroSection.addEventListener('mouseenter', () => {
            mouseGlow.classList.add('active');
        });
        
        // Masque la lueur lorsque la souris sort de la zone Hero
        heroSection.addEventListener('mouseleave', () => {
            mouseGlow.classList.remove('active');
        });
        
        // Calcule et déplace la lueur en coordonnées relatives dans la zone
        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Accélération matérielle via propriétés top/left (positionnement absolu)
            mouseGlow.style.left = `${x}px`;
            mouseGlow.style.top = `${y}px`;
        });
    }

    /* ==========================================================================
       6. MODALE INTERACTIVE DES DÉTAILS DE PROJET
       ========================================================================== 
       Gère l'ouverture, l'injection dynamique du contenu HTML à partir de la base de données
       (PROJECTS_DATA) et la fermeture propre de la fenêtre modale de détails.
    */
    const projectModal = document.getElementById('project-modal');
    const closeProjectBtn = document.getElementById('close-project-modal');
    const projectModalContent = document.getElementById('project-modal-content');
    
    // Fonction d'ouverture de la modale pour un projet spécifique
    const openProjectModal = (projectId) => {
        const data = PROJECTS_DATA[projectId];
        if (!data || !projectModal || !projectModalContent) return;
        
        // Génération dynamique des badges des technologies utilisées
        const techBadges = data.tech.map(t => 
            `<span class="bg-secondary-fixed text-on-secondary-fixed-variant px-3 py-1 rounded-full font-label-sm text-[12px] font-semibold">${t}</span>`
        ).join(' ');
        
        // Génération dynamique de la liste des fonctionnalités clés
        const featuresList = data.features.map(f => 
            `<li class="flex items-start gap-2 text-sm text-on-surface-variant">
                <span class="material-symbols-outlined text-primary text-lg fill-icon mt-0.5">check_circle</span>
                <span>${f}</span>
            </li>`
        ).join('');
        
        // Injection de la structure HTML complète du projet dans la modale
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
        
        // Activation visuelle de la modale (CSS transition opacity)
        projectModal.classList.add('active');
        projectModal.setAttribute('aria-hidden', 'false');
        // Verrouille le défilement de la page arrière-plan pour améliorer l'expérience utilisateur (UX)
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
            logoEl.innerHTML = `${h.name} Portfolio<span class="w-2 h-2 rounded-full bg-secondary inline-block ml-1"></span>`;
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
                `<p class="font-body-lg text-body-md text-on-surface-variant">${p}</p>`
            ).join('');
        }
        
        const journey1 = document.getElementById('about-journey-1');
        if (journey1 && a.journey) journey1.textContent = a.journey.text1 || '';
        
        const journey2 = document.getElementById('about-journey-2');
        if (journey2 && a.journey) journey2.textContent = a.journey.text2 || '';
        
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
    };

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

    const renderProjects = () => {
        const grid = document.getElementById('projects-grid');
        if (!grid || !PORTFOLIO_DATA.projects) return;
        
        grid.innerHTML = PORTFOLIO_DATA.projects.map((proj, projIdx) => `
          <div
            class="group glass-card rounded-xl overflow-hidden hover:shadow-[0_20px_40px_rgba(53,37,205,0.15)] project-card reveal delay-${(projIdx % 3) * 100} cursor-pointer"
            data-category="${proj.category}"
            data-project-id="${proj.id}"
          >
            <!-- Conteneur Image et boutons de liens rapides -->
            <div class="h-48 overflow-hidden relative bg-surface-container-high">
              <img
                alt="${proj.cardTitle}"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                src="${proj.image}"
              />
              <!-- Survol tactile/souris : affiche des accès externes rapides -->
              <div
                class="absolute inset-0 bg-gradient-to-t from-surface/95 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-md"
              >
                <div class="flex gap-xs">
                  ${proj.demo !== '#' ? `
                  <a
                    class="bg-white text-primary p-2 rounded-full hover:bg-primary hover:text-white transition-colors hover:scale-110 flex items-center justify-center w-8 h-8 external-link"
                    href="${proj.demo}"
                    target="_blank"
                    aria-label="Lien externe"
                    ><span class="material-symbols-outlined text-sm">link</span></a
                  >` : ''}
                  ${proj.source !== '#' ? `
                  <a
                    class="bg-white text-on-surface p-2 rounded-full hover:bg-on-surface hover:text-white transition-colors hover:scale-110 flex items-center justify-center w-8 h-8 external-link"
                    href="${proj.source}"
                    target="_blank"
                    aria-label="Code Source"
                    ><span class="material-symbols-outlined text-sm">code</span></a
                  >` : ''}
                </div>
              </div>
            </div>
            
            <!-- Informations écrites rapides de la vignette -->
            <div class="p-md flex flex-col gap-2">
              <h3
                class="font-headline-md text-body-lg font-bold text-on-surface mb-xs group-hover:text-primary transition-colors duration-300 project-title"
              >
                ${proj.cardTitle}
              </h3>
              <p
                class="font-body-md text-sm text-on-surface-variant mb-sm line-clamp-2"
              >
                ${proj.shortDescription}
              </p>
              <!-- Badges de technologies utilisés -->
              <div class="flex flex-wrap gap-2 mt-auto">
                ${proj.tech.slice(0, 3).map(t => `
                  <span class="bg-secondary-fixed text-on-secondary-fixed-variant px-2 py-1 rounded-full font-label-sm text-[12px]">${t}</span>
                `).join('')}
              </div>
            </div>
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
                    downloadPdfBtn.innerHTML = '<span class="material-symbols-outlined text-sm">download</span> Télécharger le CV PDF';
                    closeCvModal();
                    showToast("Génération du CV réussie ! Téléchargement démarré. 📄", "success");
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
        // Si l'utilisateur préfère réduire les animations, on active directement tous les éléments
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
    }

    /* ==========================================================================
       9. EFFET DE PARALLAXE DOUX (HERO BACKDROP)
       ========================================================================== 
       Fait glisser les bulles décoratives floues en arrière-plan à des vitesses 
       différentes lors du scroll pour donner une sensation de profondeur (3D).
    */
    if (!prefersReducedMotion) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            
            // Bulle supérieure droite
            document.querySelectorAll('.parallax-bg').forEach(bg => {
                const speed = parseFloat(bg.getAttribute('data-speed')) || 0.2;
                bg.style.transform = `translate(50%, calc(-50% + ${scrolled * speed}px))`;
            });
            
            // Bulle inférieure gauche
            document.querySelectorAll('.parallax-bg-bottom').forEach(bg => {
                const speed = parseFloat(bg.getAttribute('data-speed')) || -0.15;
                bg.style.transform = `translate(-50%, calc(50% + ${scrolled * speed}px))`;
            });
        });
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
            if (window.scrollY > 40) {
                navbar.classList.add('shadow-md', 'h-16');
                navbar.classList.remove('h-20');
            } else {
                navbar.classList.remove('shadow-md', 'h-16');
                navbar.classList.add('h-20');
            }
        });
    }

    /* ==========================================================================
       11. ONGLETS DE PRÉSENTATION INTERACTIFS (ABOUT SECTION)
       ========================================================================== 
       Gère le basculement fluide entre les différents onglets de la section "À Propos"
       ("Mon Histoire", "Mes Études", "Mes Valeurs").
    */
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

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

    /* ==========================================================================
       12. ANIMATION DES BARRES DE COMPÉTENCES TECHNIQUES
       ========================================================================== 
       Anime la jauge de remplissage des barres de progression jusqu'à la valeur
       indiquée dans l'attribut data-percent uniquement lorsque la section apparaît à l'écran.
    */
    function triggerSkillsAnimation() {
        const skillBars = document.querySelectorAll('.skill-bar-fill');
        const skillsSection = document.getElementById('skills');
        if (skillsSection && skillBars.length > 0 && !prefersReducedMotion) {
            const skillsObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const activeSkillBars = document.querySelectorAll('.skill-bar-fill');
                        activeSkillBars.forEach(bar => {
                            const targetWidth = bar.getAttribute('data-percent') || '0';
                            bar.style.width = `${targetWidth}%`;
                        });
                        observer.unobserve(entry.target); // Supprime l'écouteur après l'animation
                    }
                });
            }, { threshold: 0.15 });

            skillsObserver.observe(skillsSection);
        } else {
            // En cas d'animations réduites, remplit directement les jauges sans attente
            skillBars.forEach(bar => {
                const targetWidth = bar.getAttribute('data-percent') || '0';
                bar.style.width = `${targetWidth}%`;
            });
        }
    }

    /* ==========================================================================
       13. FILTRAGE DE LA GRILLE Bento DE PROJETS
       ========================================================================== 
       Filtre dynamiquement les projets affichés à l'écran sans recharger la page
       grâce à des transitions d'échelle et d'opacité fluides.
    */
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCardsGrid = document.querySelectorAll('.project-card');

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

    /* ==========================================================================
       14. COMPORTEMENT DU MENU MOBILE OVERLAY
       ========================================================================== 
       Gère l'affichage plein écran réactif du menu de navigation pour les smartphones.
    */
    const menuToggleBtn = document.getElementById('menu-toggle');
    const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
    
    if (menuToggleBtn && mobileNavOverlay) {
        const toggleIcon = menuToggleBtn.querySelector('.material-symbols-outlined');

        const toggleMobileNav = () => {
            const isOpened = mobileNavOverlay.classList.toggle('active');
            // Change l'icône de burger à fermer (X)
            if (toggleIcon) toggleIcon.textContent = isOpened ? 'close' : 'menu';
            // Empêche le défilement de l'arrière-plan lorsque le menu mobile est visible
            document.body.style.overflow = isOpened ? 'hidden' : 'auto';
        };

        menuToggleBtn.addEventListener('click', toggleMobileNav);
        
        // Ferme automatiquement le menu mobile lorsqu'un utilisateur sélectionne une ancre
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
            submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin" style="margin-right: 6px;">sync</span> Envoi en cours...';

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
