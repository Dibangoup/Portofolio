// BASE DE DONNÉES DU PORTFOLIO - CENTRALISÉE ET MODIFIABLE EN TEMPS RÉEL
const DEFAULT_PORTFOLIO_DATA = {
  "hero": {
    "name": "Jordan DIBANGOUP",
    "availability": "Disponible pour un stage",
    "role": "Développeur Full-Stack",
    "title": "Façonner l'avenir du numérique, avec l'intelligence artificielle comme alliée.",
    "description": "Étudiant en Ingénierie du Génie Logiciel à l'Université de Technologie d'Abidjan (UTA), je suis passionné par l'intelligence artificielle, le développement logiciel et les nouvelles approches de création assistée par l'IA. J'allie rigueur technique, créativité et sensibilité au design pour concevoir des expériences numériques innovantes et des solutions logicielles performantes.",
    "image": "images/jordan-portrait.jpg",
    "badges": [
      "Développeur Web",
      "Développer Mobile"
    ]
  },
  "about": {
    "title": "Créer avec Code & Innovation.",
    "paragraphs": [
      "Actuellement étudiant en Ingénierie du Génie Logiciel à l'Université de Technologie d'Abidjan (UTA), je nourris une véritable passion pour le développement Full-Stack, l'intelligence artificielle et la conception de solutions logicielles innovantes. Curieux et tourné vers l'avenir, j'explore également les nouvelles approches de développement assisté par l'IA pour transformer des idées en applications concrètes, performantes et intuitives.",
      "Je cherche à allier la rigueur de l'ingénierie logicielle à l'élégance d'un design moderne et soigné. Pour moi, une application ne doit pas seulement être fonctionnelle : elle doit être intuitive, fluide, esthétique et robuste. En combinant les architectures logicielles modernes, la créativité et les technologies émergentes, notamment l'intelligence artificielle, je conçois des solutions numériques innovantes, évolutives et centrées sur l'expérience utilisateur."
    ],
    "journey": {
      "text1": "C'est au cours de mon parcours universitaire en Ingénierie du Génie Logiciel (IGL) que j'ai découvert un véritable intérêt pour le développement informatique et les nouvelles technologies. Au fil de ma formation, cette découverte s'est transformée en une passion pour la conception de logiciels, le développement Full-Stack et l'intelligence artificielle. Depuis, je ne cesse d'explorer de nouvelles technologies et approches de développement pour enrichir mes compétences et donner vie à des idées innovantes.",
      "text2": "Aujourd'hui, je m'investis dans la conception de solutions numériques alliant qualité, performance et expérience utilisateur. J'accorde une attention particulière à chaque aspect du développement, de l'architecture logicielle aux algorithmes, jusqu'aux interactions avec l'utilisateur, afin de créer des applications utiles, fiables et à forte valeur ajoutée."
    },
    "education": [
      {
        "dates": "2023 - 2026",
        "degree": "Licence en Génie Logiciel",
        "school": "UTA – Abidjan, Côte d'Ivoire",
        "desc": "Formation approfondie en développement logiciel, architectures systèmes, bases de données, génie logiciel et méthodes agiles."
      },
      {
        "dates": "2023",
        "degree": "Baccalauréat Scientifique",
        "school": "LME3A – Aboisso",
        "desc": "Mention Passable. Spécialité Mathématiques et Sciences Physiques."
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
          "percent": 70,
          "level": "Avancé"
        },
        {
          "name": "JavaScript (ES6+) & TypeScript",
          "percent": 60,
          "level": "Intermédiaire"
        },
        {
          "name": "React & Next.js",
          "percent": 55,
          "level": "Intermédiaire"
        }
      ]
    },
    {
      "category": "Backend & Données",
      "icon": "database",
      "items": [
        {
          "name": "Python (Django / Flask)",
          "percent": 55,
          "level": "Intermédiaire"
        },
        {
          "name": "Node.js & Express",
          "percent": 15,
          "level": "En pratique"
        },
        {
          "name": "SQL (PostgreSQL / MySQL)",
          "percent": 25,
          "level": "Débutant"
        },
        {
          "name": "APIs REST & GraphQL",
          "percent": 20,
          "level": "En pratique"
        }
      ]
    },
    {
      "category": "Mobile, DevOps & IA",
      "icon": "smartphone",
      "items": [
        {
          "name": "Git & GitHub / CI-CD",
          "percent": 77,
          "level": "Avancé"
        },
        {
          "name": "Flutter & Dart",
          "percent": 20,
          "level": "En pratique"
        },
        {
          "name": "Docker & Environnements",
          "percent": 20,
          "level": "En pratique"
        },
        {
          "name": "IA & Machine Learning (Concepts & APIs)",
          "percent": 20,
          "level": "En pratique"
        }
      ]
    }
  ],
  "timeline": [
    {
      "period": "2023 - 2026",
      "role": "Licence en Génie Logiciel",
      "organization": "UTA – Abidjan, Côte d'Ivoire",
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
      "id": "ussd-birth-registration",
      "title": "Enregistrement de Naissance par USSD",
      "cardTitle": "État Civil USSD",
      "category": "web",
      "categoryLabel": "Full-Stack (API + Frontend)",
      "status": "Projet Réel",
      "shortDescription": "Service d'état civil accessible par menu USSD (*123#) depuis n'importe quel téléphone, sans smartphone ni internet.",
      "description": "Application permettant d'enregistrer une naissance via un flux de session USSD. Le backend FastAPI (Python) gère le dialogue USSD (langue, nom, confirmation) et persiste les enregistrements dans PostgreSQL. Un frontend React/Vite sert d'interface de suivi.",
      "context": "Digitaliser l'état civil dans les zones à faible connectivité, où l'USSD reste le canal le plus accessible.",
      "architecture": "FastAPI (Python) + PostgreSQL côté serveur, protocole USSD (session/texte), frontend React/Vite. API testable via Postman et curl.",
      "image": "",
      "tech": [
        "FastAPI (Python)",
        "React / Vite",
        "PostgreSQL",
        "Protocole USSD",
        "REST API"
      ],
      "features": [
        "Menu USSD multilingue (Français / Langue locale)",
        "Flux de session complet : langue → nom → confirmation",
        "Interface web de suivi des enregistrements",
        "API documentée et testable (Postman / curl)"
      ],
      "demo": "",
      "source": "https://github.com/Dibangoup/ussd-birth-registration"
    },
    {
      "id": "portfolio-moderne",
      "title": "Portfolio Développeur Carte Céleste & Dashboard Admin",
      "cardTitle": "Portfolio Carte Céleste",
      "category": "web",
      "categoryLabel": "Full-Stack & Design System",
      "status": "En Ligne",
      "shortDescription": "Portfolio interactif avec thème Carte Céleste, canvas d'étoiles, PWA et dashboard d'édition en temps réel.",
      "description": "Portfolio développé avec un thème astronomique sur mesure, un rendu en JavaScript modulaire et une interface d'administration sécurisée permettant d'éditer l'intégralité du contenu en direct avec persistance serveur.",
      "context": "Créer une identité visuelle marquante et une plateforme personnelle évolutive sans dépendre de CMS lourds.",
      "architecture": "Architecture hybride Express.js + Vanilla JS + CSS Tokens, authentification Basic Auth durcie et animations GPU accélérées.",
      "image": "",
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
      "id": "site-ecommerce",
      "title": "Site E-Commerce (React + Vite)",
      "cardTitle": "Site E-Commerce",
      "category": "web",
      "categoryLabel": "Application Web (React)",
      "status": "En Ligne",
      "shortDescription": "Site e-commerce en React avec navigation SPA et interface catalogue, déployé sur Vercel.",
      "description": "Site e-commerce développé avec React 19, Vite et React Router. Interface de catalogue produits avec navigation côté client et parcours d'achat fluide, déployé en production sur Vercel.",
      "context": "Construire une vitrine e-commerce moderne et rapide avec un rendu côté client optimisé.",
      "architecture": "React 19 + Vite + React Router, SPA avec navigation par routes, déploiement continu sur Vercel.",
      "image": "images/ecom.png",
      "tech": [
        "React",
        "Vite",
        "React Router",
        "CSS"
      ],
      "features": [
        "Catalogue de produits avec navigation par routes",
        "SPA rapide (rendu côté client, Vite)",
        "Interface responsive",
        "Déployé en production sur Vercel"
      ],
      "demo": "https://site-ecommerce-phi-black.vercel.app",
      "source": "https://github.com/Dibangoup/SiteEcommerce"
    },
    {
      "id": "tracabilite-agricole",
      "title": "Plateforme de Traçabilité Agricole",
      "cardTitle": "Traçabilité Agricole",
      "category": "web",
      "categoryLabel": "Application Web PHP",
      "status": "Projet Académique",
      "shortDescription": "Application PHP de gestion et traçabilité des produits agricoles : ajout, consultation, tableau de bord et avis.",
      "description": "Application web PHP permettant de gérer les produits agricoles : enregistrement, consultation, tableau de bord et avis consommateurs, avec authentification des utilisateurs.",
      "context": "Problématique de transparence et de suivi des produits dans la filière agro-alimentaire.",
      "architecture": "PHP + base de données SQL, authentification (login/logout), pages CRUD produits, avis et tableau de bord.",
      "image": "",
      "tech": [
        "PHP",
        "MySQL",
        "JavaScript",
        "CSS",
        "HTML"
      ],
      "features": [
        "Authentification (connexion / déconnexion)",
        "Ajout et consultation de produits",
        "Tableau de bord de suivi",
        "Avis consommateurs"
      ],
      "demo": "",
      "source": "https://github.com/Dibangoup/tracabilite-agricole"
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
        "school": "UTA – Abidjan, Côte d'Ivoire"
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
