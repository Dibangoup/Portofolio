/**
 * TAILWIND.CONFIG.JS — CONFIGURATION DE BUILD (RACINE DU PROJET)
 * ==========================================================================
 * Config utilisée par la CLI Tailwind (`npm run build:css`) pour générer
 * css/tailwind-build.css. Remplace l'ancien chargement via CDN.
 *
 * Les design tokens (couleurs, espacements, typographies) restent définis
 * ici et reprennent exactement ceux de l'ancien js/tailwind.config.js.
 * ==========================================================================
 */
module.exports = {
  content: ["./index.html", "./dashboard.html", "./js/**/*.js"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary-fixed": "#e2dfff",
        "on-primary-container": "#dad7ff",
        "outline-variant": "#c7c4d8",
        "secondary-fixed-dim": "#89ceff",
        "secondary-container": "#39b8fd",
        "on-tertiary-container": "#dadcde",
        "secondary-fixed": "#c9e6ff",
        "primary-fixed-dim": "#c3c0ff",
        "on-secondary-fixed-variant": "#004c6e",
        "surface-tint": "#4d44e3",
        "on-tertiary": "#ffffff",
        "surface-container-low": "#f0f3ff",
        "tertiary-fixed-dim": "#c4c7c9",
        error: "#ba1a1a",
        "on-secondary": "#ffffff",
        "on-background": "#111c2d",
        "on-error-container": "#93000a",
        tertiary: "#46494b",
        "surface-container-high": "#dee8ff",
        "tertiary-fixed": "#e0e3e5",
        "surface-container": "#e7eeff",
        "on-primary-fixed-variant": "#3323cc",
        "on-surface": "#111c2d",
        "on-primary": "#ffffff",
        "error-container": "#ffdad6",
        "on-surface-variant": "#464555",
        outline: "#777587",
        secondary: "#006591",
        "on-primary-fixed": "#0f0069",
        "inverse-surface": "#263143",
        background: "#f9f9ff",
        primary: "#3525cd",
        "inverse-on-surface": "#ecf1ff",
        "surface-container-lowest": "#ffffff",
        "on-error": "#ffffff",
        "on-tertiary-fixed": "#191c1e",
        "surface-dim": "#cfdaf2",
        "on-secondary-container": "#004666",
        "surface-bright": "#f9f9ff",
        "tertiary-container": "#5e6163",
        "surface-variant": "#d8e3fb",
        surface: "#f9f9ff",
        "inverse-primary": "#c3c0ff",
        "primary-container": "#4f46e5",
        "on-secondary-fixed": "#001e2f",
        "surface-container-highest": "#d8e3fb",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      spacing: {
        sm: "16px",
        xs: "8px",
        gutter: "24px",
        xl: "80px",
        "container-max": "1200px",
        base: "4px",
        md: "24px",
        lg: "48px",
      },
      fontFamily: {
        "display-lg": ["Plus Jakarta Sans"],
        "headline-md": ["Plus Jakarta Sans"],
        "body-lg": ["Inter"],
        "label-sm": ["Inter"],
        "body-md": ["Inter"],
        "display-lg-mobile": ["Plus Jakarta Sans"],
      },
      fontSize: {
        "display-lg": [
          "48px",
          {
            lineHeight: "1.1",
            letterSpacing: "-0.02em",
            fontWeight: "800",
          },
        ],
        "headline-md": [
          "24px",
          {
            lineHeight: "1.3",
            letterSpacing: "-0.01em",
            fontWeight: "700",
          },
        ],
        "body-lg": [
          "18px",
          {
            lineHeight: "1.6",
            fontWeight: "400",
          },
        ],
        "label-sm": [
          "14px",
          {
            lineHeight: "1",
            letterSpacing: "0.05em",
            fontWeight: "600",
          },
        ],
        "body-md": [
          "16px",
          {
            lineHeight: "1.5",
            fontWeight: "400",
          },
        ],
        "display-lg-mobile": [
          "32px",
          {
            lineHeight: "1.2",
            fontWeight: "800",
          },
        ],
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/container-queries"),
  ],
};
