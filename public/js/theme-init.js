/* THEME-INIT.JS - chargé de façon synchrone dans le <head>.
   Applique le thème choisi (clair/sombre) avant le premier rendu pour éviter
   un flash, et signale au CSS que JavaScript est actif (animations d'entrée).
   Sans choix enregistré, le CSS suit prefers-color-scheme. */
(function () {
    var root = document.documentElement;
    root.classList.add('js');
    try {
        var saved = localStorage.getItem('portfolio_theme');
        if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);
    } catch (e) { /* stockage indisponible : on suit le système */ }
})();
