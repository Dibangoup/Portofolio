// BASE DE DONNÉES DU PORTFOLIO - CENTRALISÉE ET MODIFIABLE EN TEMPS RÉEL
const DEFAULT_PORTFOLIO_DATA = {
  "hero": {
    "name": "Jordan",
    "availability": "Disponible pour un stage",
    "role": "Développeur Full-Stack",
    "title": "Concevoir l'Avenir, Une Ligne de Code à la Fois.",
    "description": "Étudiant passionné en Génie Informatique, IA. Je combine logique technique et créativité pour créer des expériences marquantes.",
    "image": "images/jordan-portrait.jpg",
    "badges": [
      "Développeur Web",
      "Développeur Mobile"
    ]
  },
  "about": {
    "title": "Créer avec Code & Innovation.",
    "paragraphs": [
      "Actuellement étudiant en informatique plus précisément en Génie Logiciel, j'ai développé une passion profonde pour le développement web full-stack, l'intelligence artificielle et la data science.",
      "Je m'attache à réduire le fossé entre la rigueur de l'ingénierie logicielle et l'élégance d'un design visuel moderne et soigné. Pour moi, le code doit être aussi fluide, intuitif et harmonieux que le monde qui nous entoure. En combinant mes compétences techniques à la puissance des outils d'intelligence artificielle, je souhaite concevoir des applications innovantes, performantes et centrées sur l'expérience utilisateur."
    ],
    "journey": {
      "text1": "Passionné de nouvelles technologies depuis mon plus jeune âge, j'ai démarré le codage de petites applications avant de plonger dans l'écosystème web moderne avec React et Node.js.",
      "text2": "Aujourd'hui, je crée des produits soignés en m'assurant que chaque animation et interaction apporte une réelle plus-value à l'expérience de l'utilisateur final."
    },
    "education": [
      {
        "dates": "2023 - 2026",
        "degree": "Licence en Génie Logiciel",
        "school": "ESATIC – Abidjan, Côte d'Ivoire",
        "desc": "Formation approfondie en développement logiciel, bases de données, systèmes d'exploitation et méthodes agiles."
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
        "desc": "Je reste à l'affût des dernières technologies pour proposer des solutions modernes."
      },
      {
        "emoji": "🎨",
        "title": "Design",
        "desc": "L'esthétique et l'ergonomie sont au cœur de chaque projet que je réalise."
      },
      {
        "emoji": "🤝",
        "title": "Collaboration",
        "desc": "Je crois au travail d'équipe et à l'échange de compétences pour avancer ensemble."
      },
      {
        "emoji": "📚",
        "title": "Apprentissage",
        "desc": "Chaque jour est une nouvelle occasion d'apprendre et de progresser."
      }
    ]
  },
  "skills": [
    {
      "category": "Frontend & UI",
      "icon": "palette",
      "items": [
        {
          "name": "HTML5 & CSS3",
          "percent": 81
        },
        {
          "name": "JavaScript (ES6+)",
          "percent": 75
        },
        {
          "name": "React",
          "percent": 70
        },
        {
          "name": "Tailwind CSS",
          "percent": 40
        }
      ]
    },
    {
      "category": "Backend & APIs",
      "icon": "database",
      "items": [
        {
          "name": "Python (Flask/Django)",
          "percent": 55
        },
        {
          "name": "SQL (MySQL/PostgreSQL)",
          "percent": 50
        },
        {
          "name": "API REST & GraphQL",
          "percent": 25
        }
      ]
    },
    {
      "category": "Mobile & Autres",
      "icon": "smartphone",
      "items": [
        {
          "name": "Flutter & Dart",
          "percent": 35
        },
        {
          "name": "Git & GitHub",
          "percent": 80
        },
        {
          "name": "IA & Machine Learning",
          "percent": 5
        }
      ]
    }
  ],
  "projects": [
    {
      "id": "tracabilite-agricole",
      "title": "Système de Traçabilité Agricole Intelligent",
      "cardTitle": "Traçabilité Agricole",
      "category": "web",
      "categoryLabel": "Web App Full-Stack",
      "shortDescription": "Plateforme de suivi de la chaîne d'approvisionnement agricole avec blockchain et IoT.",
      "description": "Application web complète permettant de tracer les produits agricoles depuis la ferme jusqu'au consommateur. Utilisation de la blockchain pour l'authenticité des données et intégration de capteurs IoT pour le suivi des conditions de stockage en temps réel.",
      "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuDz7XS5kpXghKL-PdviAJbJLwm9PYrtMQN491Cb4A61rI3P8zFkh-4BxRJJMEYgBpLiI03FydyNz9rLiZ38argCMcrTGx-3GmmZ1IBGSXMYGCi247t2pz34QpSL5H-jzLcoglsq-KeLP5LMlTdy2C9wdfBc8reOL5Znxkvun9KBib6wXkyk6Jl_8Z1j9fU3-UCqPlyWl78-iLw5m7-uuO23OKZrIoP8OKXM1hxda4tCqcdVb9B5cMxnE874ms3HkL5MVDbjzDn4elAX",
      "tech": [
        "HTML5",
        "CSS3",
        "JavaScript (ES6+)",
        "PHP"
      ],
      "features": [
        "Tableau de bord interactif avec visualisation en temps réel",
        "Système de QR code pour scanner et vérifier l'authenticité",
        "Notifications automatiques lors des anomalies de température",
        "Export de rapports PDF et statistiques avancées"
      ],
      "demo": "#",
      "source": "https://github.com/jordan/tracabilite-agricole"
    },
    {
      "id": "portfolio-moderne",
      "title": "Portfolio Étudiant Premium & Interactif",
      "cardTitle": "Portfolio Moderne",
      "category": "web",
      "categoryLabel": "Site Vitrine",
      "shortDescription": "Site portfolio personnel avec animations premium, mode glassmorphisme et CV interactif.",
      "description": "Portfolio développé avec HTML, Tailwind CSS et JavaScript vanilla. Design glassmorphique avec des animations soignées, un visualiseur de CV interactif et des effets de parallaxe. Le site est entièrement responsive et optimisé pour le SEO.",
      "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuC2SYCIchKQjNY8S4EvVUP_MfFJK-_cWlN0pqIz8gJ7kzWCbbCWEGitwOYqN2bQGqFxnvLLHWnl-PeW_DynWiSf7c0oixHCXNGMOY3HZFmrWe",
      "tech": [
        "HTML5",
        "Tailwind CSS",
        "JavaScript",
        "CSS Animations"
      ],
      "features": [
        "Design glassmorphique premium et responsive",
        "CV interactif avec simulation de téléchargement PDF",
        "Animations de scroll reveal et effets parallaxe",
        "Formulaire de contact avec validation et notifications toast"
      ],
      "demo": "#",
      "source": "#"
    },
    {
      "id": "app-gestion-taches",
      "title": "Application de Gestion de Tâches Collaboratives",
      "cardTitle": "Gestionnaire de Tâches",
      "category": "mobile",
      "categoryLabel": "Application Mobile",
      "shortDescription": "Application mobile de gestion de projets et tâches en équipe avec synchronisation en temps réel.",
      "description": "Application mobile développée avec React Native permettant aux équipes de gérer leurs projets et tâches de manière collaborative. Synchronisation en temps réel via Firebase, notifications push et interface intuitive avec drag & drop.",
      "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuDz7XS5kpXghKL-PdviAJbJLwm9PYrtMQN491Cb4A61rI3P8zFkh-4BxRJJMEYgBpLiI03FydyNz9rLiZ38argCMcrTGx-3GmmZ1IBGSXMYGCi247t2pz34QpSL5H-jzLcoglsq-KeLP5LMlTdy2C9wdfBc8reOL5Znxkvun9KBib6wXkyk6Jl_8Z1j9fU3-UCqPlyWl78-iLw5m7-uuO23OKZrIoP8OKXM1hxda4tCqcdVb9B5cMxnE874ms3HkL5MVDbjzDn4elAX",
      "tech": [
        "React Native",
        "Firebase",
        "Redux",
        "Expo"
      ],
      "features": [
        "Synchronisation en temps réel entre les membres",
        "Notifications push personnalisées",
        "Interface de glisser-déposer intuitive",
        "Statistiques de productivité et rapports hebdomadaires"
      ],
      "demo": "#",
      "source": "#"
    },
    {
      "id": "refonte-agence",
      "title": "Refonte Site Web d'Agence de Communication",
      "cardTitle": "Site Agence Digitale",
      "category": "web",
      "categoryLabel": "Site Vitrine Premium",
      "shortDescription": "Refonte complète du site d'une agence avec design moderne et animations dynamiques.",
      "description": "Refonte complète de l'identité visuelle et du site web d'une agence de communication. Nouveau design épuré et premium avec des animations GSAP, un système de galerie filtrable et une section de témoignages clients interactive.",
      "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuC2SYCIchKQjNY8S4EvVUP_MfFJK-_cWlN0pqIz8gJ7kzWCbbCWEGitwOYqN2bQGqFxnvLLHWnl-PeW_DynWiSf7c0oixHCXNGMOY3HZFmrWe",
      "tech": [
        "Next.js",
        "GSAP",
        "Tailwind",
        "Vercel"
      ],
      "features": [
        "Animations avancées avec GSAP ScrollTrigger",
        "Galerie de projets filtrable avec transitions fluides",
        "Section de témoignages clients avec carrousel",
        "Formulaire de devis avec estimation automatique"
      ],
      "demo": "#",
      "source": "https://github.com/jordan/refonte-agence"
    }
  ],
  "cv": {
    "identity": {
      "name": "Jordan DIBANGOU",
      "role": "Développeur Full-Stack & UI Designer",
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
      "Node.js",
      "Express",
      "Python",
      "JavaScript",
      "TypeScript",
      "SQL",
      "MongoDB",
      "Git",
      "Figma",
      "Tailwind CSS",
      "Docker",
      "Firebase",
      "REST API"
    ],
    "languages": [
      "🇫🇷 Français (Maternelle)",
      "🇬🇧 Anglais (Professionnel - B2)",
      "🇪🇸 Espagnol (Notions - A2)"
    ],
    "experiences": [
      {
        "dates": "Juin - Août 2025",
        "role": "Développeur Web Stagiaire",
        "company": "Startup Tech – Abidjan",
        "description": "Développement de fonctionnalités frontend en React, intégration d'API REST, participation aux sprints agiles et revues de code."
      },
      {
        "dates": "Jan - Mars 2025",
        "role": "Freelance UI/UX Designer",
        "company": "Divers clients",
        "description": "Création de maquettes Figma et prototypes interactifs pour des sites vitrines et applications mobiles. Analyse UX et tests utilisateurs."
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
