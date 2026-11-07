/* ==========================================================================
   Lecteur du CV en PDF (PDF.js hébergé dans /vendor/pdfjs/)
   Partagé par le site (fenêtre « Mon CV ») et par l'aperçu du dashboard.
   Rendu page par page dans des <canvas> : fonctionne aussi sur les téléphones,
   où le lecteur PDF intégré du navigateur ne s'affiche pas dans une page.
   ========================================================================== */
(function () {
    'use strict';

    const BASE = '/vendor/pdfjs/';
    let libPromise = null;

    function loadPdfjs() {
        if (!libPromise) {
            libPromise = import(BASE + 'pdf.min.mjs').then((lib) => {
                lib.GlobalWorkerOptions.workerSrc = BASE + 'pdf.worker.min.mjs';
                return lib;
            });
            // Un échec de chargement (réseau) ne doit pas bloquer les essais suivants.
            libPromise.catch(() => { libPromise = null; });
        }
        return libPromise;
    }

    /**
     * Affiche toutes les pages du PDF `url` dans `container` (vidé au préalable).
     * Renvoie le nombre de pages. Un nouvel appel sur le même conteneur annule le précédent.
     */
    async function render(container, url, { label = 'Page' } = {}) {
        const token = Symbol('cv-render');
        container.__cvToken = token;
        const stale = () => container.__cvToken !== token;

        const lib = await loadPdfjs();
        const task = lib.getDocument({
            url,
            // Pas de new Function()/eval : la CSP du site (script-src 'self') l'interdit.
            isEvalSupported: false,
            standardFontDataUrl: BASE + 'standard_fonts/',
        });
        const doc = await task.promise;

        try {
            if (stale()) return 0;
            // Largeur disponible ; repli si le conteneur est encore caché (largeur nulle).
            const width = Math.min(container.clientWidth || 800, 1100);
            // Densité limitée à 2 : au-delà, la mémoire des canvas explose sur mobile.
            const density = Math.min(window.devicePixelRatio || 1, 2);
            const pages = [];

            for (let n = 1; n <= doc.numPages; n += 1) {
                const page = await doc.getPage(n);
                if (stale()) return 0;
                const base = page.getViewport({ scale: 1 });
                const viewport = page.getViewport({ scale: (width / base.width) * density });

                const canvas = document.createElement('canvas');
                canvas.className = 'cv-pdf-page';
                canvas.width = Math.floor(viewport.width);
                canvas.height = Math.floor(viewport.height);
                // Taille d'affichage posée ici (CSSOM, autorisé par la CSP) pour fonctionner
                // aussi dans le dashboard, qui ne charge pas les styles du site.
                canvas.style.display = 'block';
                canvas.style.width = '100%';
                canvas.style.height = 'auto';
                canvas.setAttribute('role', 'img');
                canvas.setAttribute('aria-label', `${label} ${n} / ${doc.numPages}`);

                await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
                pages.push(canvas);
            }

            if (stale()) return 0;
            container.replaceChildren(...pages);
            return doc.numPages;
        } finally {
            // Libère le document et son worker : les canvas gardent l'image rendue.
            doc.destroy();
        }
    }

    window.CvViewer = { render };
})();
