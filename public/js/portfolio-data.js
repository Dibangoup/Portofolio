// BASE DE DONNÉES DU PORTFOLIO - CENTRALISÉE ET MODIFIABLE EN TEMPS RÉEL
const DEFAULT_PORTFOLIO_DATA = {
  "hero": {
    "name": "Jordan DIBANGOUP",
    "availability": "Disponible pour un stage",
    "role": "Développeur Full-Stack & Génie Logiciel",
    "title": "Concevoir l'Avenir, Une Ligne de Code à la Fois.",
    "description": "Étudiant passionné en Génie Logiciel, IA & Data Science à l'ESATIC. Je combine rigueur d'ingénierie et sensibilité design pour bâtir des solutions logicielles performantes.",
    "image": "images/jordan-portrait.jpg",
    "badges": [
      "Développeur Full-Stack",
      "Génie Logiciel & IA"
    ]
  },
  "about": {
    "title": "Créer avec Code & Innovation.",
    "paragraphs": [
      "Actuellement étudiant en informatique plus précisément en Génie Logiciel à l'ESATIC (Abidjan), j'ai développé une passion profonde pour le développement full-stack, l'intelligence artificielle et l'ingénierie logicielle.",
      "Je m'attache à réduire le fossé entre la rigueur de l'ingénierie logicielle et l'élégance d'un design visuel moderne et soigné. Pour moi, le code doit être aussi fluide, intuitif et robuste que le monde qui nous entoure. En combinant mes compétences techniques aux architectures modernes, je conçois des applications innovantes, scalables et centrées sur l'utilisateur."
    ],
    "journey": {
      "text1": "Passionné de nouvelles technologies depuis mon plus jeune âge, j'ai démarré le codage de petites applications avant de plonger dans l'écosystème web moderne avec React, Python et Node.js.",
      "text2": "Aujourd'hui, je crée des produits soignés en m'assurant que chaque architecture, algorithme et interaction apporte une réelle plus-value et des performances optimales."
    },
    "education": [
      {
        "dates": "2023 - 2026",
        "degree": "Licence en Génie Logiciel",
        "school": "ESATIC – Abidjan, Côte d'Ivoire",
        "desc": "Formation approfondie en développement logiciel, architectures systèmes, bases de données, génie logiciel et méthodes agiles."
      },
      {
        "dates": "2023",
        "degree": "Baccalauréat Scientifique",
        "school": "Lycée Classique – Abidjan",
        "desc": "Mention Bien. Spécialité Mathématiques et Sciences Physiques."
      }
    ],
    "values": [
      {
        "emoji": "🚀",
        "title": "Innovation",
        "desc": "Je reste à l'affût des dernières technologies pour proposer des architectures logicielles modernes et efficientes."
      },
      {
        "emoji": "🎨",
        "title": "Design & Ergonomie",
        "desc": "L'esthétique, l'accessibilité et la fluidité UX sont au cœur de chaque application que je conçois."
      },
      {
        "emoji": "⚙️",
        "title": "Rigueur Technique",
        "desc": "Je privilégie un code propre, modulaire, sécurisé et documenté selon les standards du génie logiciel."
      },
      {
        "emoji": "📚",
        "title": "Apprentissage Continu",
        "desc": "Veille technologique constante pour maîtriser les outils émergents en IA, cloud et développement web."
      }
    ]
  },
  "skills": [
    {
      "category": "Frontend & UI",
      "icon": "palette",
      "items": [
        {
          "name": "HTML5 & CSS3 / Tailwind",
          "percent": 90,
          "level": "Avancé"
        },
        {
          "name": "JavaScript (ES6+) & TypeScript",
          "percent": 85,
          "level": "Avancé"
        },
        {
          "name": "React & Next.js",
          "percent": 80,
          "level": "Maîtrisé"
        },
        {
          "name": "UI/UX Design (Figma)",
          "percent": 75,
          "level": "Opérationnel"
        }
      ]
    },
    {
      "category": "Backend & Données",
      "icon": "database",
      "items": [
        {
          "name": "Python (Django / Flask)",
          "percent": 80,
          "level": "Maîtrisé"
        },
        {
          "name": "Node.js & Express",
          "percent": 75,
          "level": "Opérationnel"
        },
        {
          "name": "SQL (PostgreSQL / MySQL)",
          "percent": 78,
          "level": "Maîtrisé"
        },
        {
          "name": "APIs REST & GraphQL",
          "percent": 70,
          "level": "Opérationnel"
        }
      ]
    },
    {
      "category": "Mobile, DevOps & IA",
      "icon": "smartphone",
      "items": [
        {
          "name": "Git & GitHub / CI-CD",
          "percent": 85,
          "level": "Avancé"
        },
        {
          "name": "Flutter & Dart",
          "percent": 65,
          "level": "Opérationnel"
        },
        {
          "name": "Docker & Environnements",
          "percent": 60,
          "level": "Opérationnel"
        },
        {
          "name": "IA & Machine Learning (Concepts & APIs)",
          "percent": 60,
          "level": "En pratique"
        }
      ]
    }
  ],
  "timeline": [
    {
      "period": "2025 - Présent",
      "role": "Développeur Full-Stack (Projets & Freelance)",
      "organization": "Projets Indépendants & Académiques",
      "type": "experience",
      "description": "Conception d'architectures complètes (Django, React, Node.js), intégration d'APIs sécurisées et déploiements cloud."
    },
    {
      "period": "Juin - Août 2025",
      "role": "Développeur Web Stagiaire",
      "organization": "Startup Tech – Abidjan",
      "type": "experience",
      "description": "Développement de composants frontend dynamiques en React, intégration d'APIs REST et participation aux revues de code en méthode Scrum."
    },
    {
      "period": "2023 - 2026",
      "role": "Licence en Génie Logiciel",
      "organization": "ESATIC – Abidjan, Côte d'Ivoire",
      "type": "formation",
      "description": "Spécialisation en génie logiciel, algorithmique avancée, structures de données, bases de données relationnelles et ingénierie logicielle."
    },
    {
      "period": "2023",
      "role": "Baccalauréat Scientifique (Mention Bien)",
      "organization": "Lycée Classique – Abidjan",
      "type": "formation",
      "description": "Spécialité Mathématiques et Sciences Physiques."
    }
  ],
  "projects": [
    {
      "id": "tracabilite-agricole",
      "title": "Système de Traçabilité Agricole Intelligent",
      "cardTitle": "Traçabilité Agricole",
      "category": "web",
      "categoryLabel": "Web App Full-Stack",
      "status": "Académique & Prototype",
      "shortDescription": "Plateforme de suivi et traçabilité de la chaîne d'approvisionnement agricole avec IoT et sécurité des données.",
      "description": "Application web complète permettant de tracer les produits agricoles depuis la coopérative jusqu'au consommateur. Visualisation en temps réel des flux logistiques, gestion des alertes et tableaux de bord analytiques pour optimiser les rendements et réduire les pertes.",
      "context": "Problématique de transparence et de lutte contre les pertes post-récolte dans la filière agro-alimentaire.",
      "architecture": "Architecture MVC découplée, API REST sécurisée, interface dynamique et visualisation cartographique des données de stockage.",
      "image": "images/tracabilite-agricole.png",
      "tech": [
        "Python / Django",
        "JavaScript (ES6+)",
        "PostgreSQL",
        "Chart.js",
        "Tailwind CSS"
      ],
      "features": [
        "Tableau de bord interactif avec métriques en temps réel",
        "Génération et scan de QR codes pour authentification des lots",
        "Système d'alertes en cas d'anomalies de stockage",
        "Exportation de rapports analytiques et statistiques détaillées"
      ],
      "demo": "",
      "source": "https://github.com/Dibangoup/tracabilite-agricole"
    },
    {
      "id": "portfolio-moderne",
      "title": "Portfolio Développeur Carte Céleste & Dashboard Admin",
      "cardTitle": "Portfolio Carte Céleste",
      "category": "web",
      "categoryLabel": "Full-Stack & Design System",
      "status": "En Ligne",
      "shortDescription": "Portfolio interactif haute performance avec thème Carte Céleste, canvas d'étoiles, PWA et dashboard d'édition en temps réel.",
      "description": "Portfolio développé avec un thème astronomique sur mesure, un rendu en JavaScript modulaire et une interface d'administration sécurisée permettant d'éditer l'intégralité du contenu en direct avec persistance serveur.",
      "context": "Créer une identité visuelle marquante et une plateforme personnelle évolutive sans dépendre de CMS lourds.",
      "architecture": "Architecture hybride Express.js + Vanilla JS + CSS Tokens, authentification Basic Auth durcie et animations GPU accélérées.",
      "image": "images/portfolio-preview.png",
      "tech": [
        "Node.js & Express",
        "HTML5 Canvas",
        "Vanilla JavaScript",
        "CSS Custom Properties",
        "PWA"
      ],
      "features": [
        "Champ stellaire interactif animé au Canvas",
        "Dashboard d'administration sécurisé en temps réel",
        "Visualiseur et exportateur de CV interactif",
        "Mode PWA et support hors-ligne"
      ],
      "demo": "/",
      "source": "https://github.com/Dibangoup/Portofolio"
    },
    {
      "id": "app-gestion-taches",
      "title": "Application de Gestion de Tâches & Projets Collaboratifs",
      "cardTitle": "Gestionnaire de Tâches",
      "category": "mobile",
      "categoryLabel": "Application Mobile",
      "status": "Projet Mobile",
      "shortDescription": "Application mobile de gestion de projets d'équipe avec synchronisation cloud et interface intuitive.",
      "description": "Application mobile conçue pour organiser les flux de travail en équipe : attribution de tâches, suivi de progression, rappels et notifications en temps réel pour booster la productivité collective.",
      "context": "Besoin d'un outil mobile léger et réactif pour gérer les projets de groupe académiques et associatifs.",
      "architecture": "Application Flutter / React Native avec gestion d'état centralisée et persistance locale + synchronisation cloud.",
      "image": "images/gestion-taches.png",
      "tech": [
        "Flutter / Dart",
        "Firebase Firestore",
        "State Management",
        "REST API"
      ],
      "features": [
        "Organisation des tâches en tableaux visuels",
        "Synchronisation cloud en temps réel",
        "Filtres par priorité, date d'échéance et responsable",
        "Statistiques de productivité et historique d'activité"
      ],
      "demo": "",
      "source": "https://github.com/Dibangoup"
    },
    {
      "id": "refonte-agence",
      "title": "Plateforme Web Digitale & E-Commerce",
      "cardTitle": "Plateforme Web Digitale",
      "category": "web",
      "categoryLabel": "Web App Full-Stack",
      "status": "Projet Académique",
      "shortDescription": "Application web moderne avec catalogue dynamique, authentification et tunnel de commande.",
      "description": "Développement d'une plateforme web complète intégrant catalogue de produits interactif, gestion de panier, interface d'administration pour la gestion des stocks et interface utilisateur fluide.",
      "context": "Digitalisation du parcours client pour commerces de proximité avec expérience utilisateur sans friction.",
      "architecture": "Frontend React avec rendu réactif, Backend Node/Express ou Django, base de données relationnelle et validation de formulaires.",
      "image": "images/ecom.png",
      "tech": [
        "React",
        "Node.js",
        "PostgreSQL",
        "Tailwind CSS"
      ],
      "features": [
        "Catalogue avec filtres et recherche instantanée",
        "Système d'authentification et gestion de profil",
        "Panier d'achat interactif et calcul automatique",
        "Panneau d'administration pour gestion des articles"
      ],
      "demo": "",
      "source": "https://github.com/Dibangoup"
    }
  ],
  "cv": {
    "identity": {
      "name": "Jordan DIBANGOUP",
      "role": "Développeur Full-Stack & Génie Logiciel",
      "availability": "Disponible pour un stage ou une alternance"
    },
    "contact": {
      "email": "jdibangoup5@gmail.com",
      "phone": "+225 07 12 48 50 23",
      "location": "Abidjan, Côte d'Ivoire"
    },
    "skills": [
      "React",
      "Next.js",
      "Python (Django/Flask)",
      "Node.js / Express",
      "JavaScript / TypeScript",
      "PostgreSQL / MySQL",
      "APIs REST & GraphQL",
      "Git & GitHub",
      "Docker",
      "Flutter",
      "Tailwind CSS",
      "Figma UI/UX"
    ],
    "languages": [
      "🇫🇷 Français (Maternelle)",
      "🇬🇧 Anglais (Professionnel - B2)",
      "🇪🇸 Espagnol (Notions - A2)"
    ],
    "experiences": [
      {
        "dates": "2025 - Présent",
        "role": "Développeur Full-Stack (Projets & Freelance)",
        "company": "Projets Indépendants",
        "description": "Conception et déploiement d'applications web (React, Django, Node.js), création d'APIs RESTful et optimisation des performances front/back."
      },
      {
        "dates": "Juin - Août 2025",
        "role": "Développeur Web Stagiaire",
        "company": "Startup Tech – Abidjan",
        "description": "Développement de fonctionnalités frontend en React, intégration d'APIs REST, participation aux sprints agiles Scrum et revues de code."
      },
      {
        "dates": "Jan - Mars 2025",
        "role": "Freelance UI/UX Designer",
        "company": "Clients Indépendants",
        "description": "Conception de parcours utilisateurs, wireframes et prototypes interactifs Figma pour applications web et mobiles."
      }
    ],
    "formations": [
      {
        "dates": "2023 - 2026",
        "degree": "Licence en Génie Logiciel",
        "school": "ESATIC – Abidjan, Côte d'Ivoire"
      },
      {
        "dates": "2023",
        "degree": "Baccalauréat Scientifique (Mention Bien)",
        "school": "Lycée Classique – Abidjan"
      }
    ]
  },
  "contact": {
    "email": "jdibangoup5@gmail.com",
    "location": "Abidjan, Côte d'Ivoire",
    "github": "https://github.com/Dibangoup",
    "linkedin": "https://www.linkedin.com/in/jordan-dibangoup-3373a3375"
  }
};

// Variable globale pour stocker les données chargées en mémoire
var PORTFOLIO_DATA = DEFAULT_PORTFOLIO_DATA;
