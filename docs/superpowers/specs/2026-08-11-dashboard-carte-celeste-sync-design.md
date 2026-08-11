# Dashboard — Carte Céleste Sync (spec)

## Contexte

Le dashboard admin (`dashboard.html` + `css/dashboard.css`, script inline) a été redesigné en juillet 2026 ("Atelier redesign" : nav en rail, palette de commandes, aperçu live, drag & drop, score de santé, historique de sauvegarde). Il fonctionne bien et garde sa propre identité visuelle (indigo/violet/cyan, distincte du site public) — cette identité n'est **pas** modifiée par ce travail.

Le 10-11 août 2026, le site public (`index.html`, `js/app.js`, `css/*.css`) a été entièrement refondu vers la direction "Carte Céleste" (navy `#0F1B2E` / or `#E8A23C`, police Space Grotesk auto-hébergée, bibliothèque d'icônes SVG maison `js/icons.js` remplaçant Material Symbols, surfaces plates sans dégradé ni glassmorphisme). Cette refonte n'a touché ni `dashboard.html` ni `css/dashboard.css`.

Résultat : le dashboard contient maintenant des éléments visuellement ou textuellement obsolètes par rapport au vrai site qu'il édite. Cette spec couvre uniquement la correction de ces décalages — pas de refonte visuelle du dashboard lui-même, pas de nouvelles fonctionnalités. Ces deux volets suivront dans une spec séparée une fois celle-ci livrée.

## Portée

**Dans le périmètre :**
1. Restyle du panneau "Aperçu live" (Hero/Compétences/Projets) pour refléter les vrais tokens Carte Céleste.
2. Élargissement du panneau à deux nouveaux blocs : À propos et Contact.
3. Remplacement du champ texte libre "Icône Google Material" par un vrai sélecteur visuel des 4 icônes valides.
4. Correction du bug de scroll-reveal cassé après une édition live (bug pré-existant, documenté, pas introduit par cette refonte).

**Hors périmètre (explicitement) :**
- Toute modification de l'identité visuelle propre du dashboard (`--primary-color`, `--bg-dark`, `--teal`, la nav en rail, la palette de commandes, etc.).
- Toute nouvelle fonctionnalité (validation de formulaire, actions en masse, aperçu mobile, etc.).
- L'aperçu live ne réplique pas les onglets/interactions du site (ex : pas d'onglets Mon Histoire/Études/Valeurs pour À propos, pas de vrai formulaire pour Contact) — juste un aperçu passif du contenu, comme c'est déjà le cas pour Hero/Compétences/Projets.
- Le deuxième bug de prévisualisation live déjà documenté (filtre de projets cassé après édition live) semble déjà résolu comme effet de bord de la refonte Carte Céleste (Task 6 a réécrit le gestionnaire de filtre pour re-requêter le DOM à chaque clic plutôt que de capturer une NodeList une fois). Ce point 4 inclut une vérification explicite de cet état, pas une nouvelle correction si déjà résolu.
- `js/portfolio-data.js` — son schéma ne change pas.
- L'authentification du dashboard (`server.js`, `.env`) — non touchée.

## 1. Restyle du panneau Aperçu live (Hero/Compétences/Projets)

### État actuel (obsolète)

`css/dashboard.css` (lignes ~599-775) définit `.mock-*` avec :
- `.mock-hero` : `background: radial-gradient(340px 240px at 50% -20%, rgba(53, 37, 205, 0.35), transparent 70%)` — dégradé violet, contraire au principe Carte Céleste "surfaces plates uniquement".
- `.mock-title` : `font-family: "Plus Jakarta Sans", sans-serif` — ancienne police du site.
- `.mock-role` : `color: var(--primary-container)` (`#503ee4`, violet) — plus la couleur du site.
- `.mock-badge` : `background: var(--teal-soft); color: var(--teal)` (`#2dd9c2`, cyan) — jamais utilisé sur le nouveau site.
- `.mock-skill-row .bar i` : `background: linear-gradient(90deg, var(--primary-container), var(--teal))` — dégradé violet→cyan ; le vrai site utilise un remplissage plat or (`.skill-bar-fill { background: var(--accent); }`).
- `.mock-proj-thumb` : couleur de repli `rgba(53, 37, 205, 0.2)` (violet).

### Cible

Introduire un petit jeu de custom properties **scopées à `.preview-col`** (pas au `:root` global du dashboard, pour ne pas entrer en collision avec les tokens propres du dashboard — `--primary-color` etc. restent inchangés partout ailleurs) :

```css
.preview-col {
  --cc-bg: #0F1B2E;
  --cc-bg-2: #16273D;
  --cc-ink: #F3F1E8;
  --cc-ink-70: rgba(243, 241, 232, .72);
  --cc-ink-45: rgba(243, 241, 232, .52);
  --cc-line: rgba(243, 241, 232, .14);
  --cc-accent: #E8A23C;
  --cc-accent-ink: #F0B65E;
}
```

Ces valeurs sont copiées telles quelles depuis `css/glass.css`'s `:root` (source de vérité du site). Puis remapper chaque règle `.mock-*` concernée :
- `.mock-frame` : fond `var(--cc-bg)` au lieu de `#050409` codé en dur ; bordure `1px solid var(--cc-line)` au lieu de `var(--border-color)` (dashboard) pour matcher visuellement le vrai cadre du site.
- `.mock-hero` : supprimer le dégradé radial, fond plat `var(--cc-bg)`.
- `.mock-title` : `font-family: 'Space Grotesk', -apple-system, sans-serif`. Charger Space Grotesk via Google Fonts CDN dans `dashboard.html` (même mécanisme que les polices Inter/Plus Jakarta Sans déjà chargées là — le dashboard n'a pas la contrainte d'auto-hébergement du site public, qui concerne les visiteurs, pas l'admin), poids 700 uniquement.
- `.mock-role` : `color: var(--cc-accent-ink)`.
- `.mock-desc` : `color: var(--cc-ink-70)`.
- `.mock-badge` : `background: transparent; color: var(--cc-accent); border: 1px solid var(--cc-accent)` — mimant `.hero-status` du vrai site (pastille discrète, pas de fond plein).
- `.mock-floaters span` : `background: var(--cc-bg-2); border: 1px solid var(--cc-line); color: var(--cc-ink-70)` — mimant `.tech-pill`/badge du vrai site.
- `.mock-skill-row .name` : `color: var(--cc-ink-70)`.
- `.mock-skill-row .bar` : fond `var(--cc-line)`.
- `.mock-skill-row .bar i` : remplacer le dégradé par un remplissage plat `background: var(--cc-accent)`.
- `.mock-proj-card` : fond `var(--cc-bg-2)`, bordure `1px solid var(--cc-line)`.
- `.mock-proj-thumb` : couleur de repli `var(--cc-bg-2)` au lieu du violet.
- `.mock-proj-name` : `color: var(--cc-ink)`.
- `.mock-avatar` : bordure `1px solid var(--cc-line)` au lieu de `rgba(255,255,255,.15)`.

Le `.preview-head`, `.badge-live`, `.preview-note` et le fond général de `.preview-col` (`rgba(255,255,255,0.012)`) restent inchangés — ce sont des éléments de chrome du dashboard lui-même, pas une reproduction du site.

Aucune modification de `syncHeroPreview()`, `syncSkillsPreview()`, `syncProjectsPreview()` (JS) n'est nécessaire pour ce point — c'est purement un remaniement CSS, les fonctions continuent d'écrire dans les mêmes éléments `#mock-*`.

## 2. Élargissement du panneau : blocs À propos et Contact

### Nouveau HTML (dans `<aside class="preview-col" id="preview-col">`, après le bloc Projets existant et avant `.preview-note`)

Bloc À propos :
```html
<div class="mock-block-title">À propos</div>
<div class="mock-about">
  <div class="mock-about-title" id="mock-about-title"></div>
  <p class="mock-about-text" id="mock-about-text"></p>
</div>
```

Bloc Contact :
```html
<div class="mock-block-title">Contact</div>
<div class="mock-contact" id="mock-contact"></div>
```

### Nouvelles règles CSS (`css/dashboard.css`, ajoutées après les règles `.mock-proj-*` existantes)

- `.mock-about-title` : `font-family: 'Space Grotesk', -apple-system, sans-serif; font-size: 12.5px; font-weight: 700; color: var(--cc-ink); margin-bottom: 6px;`
- `.mock-about-text` : `font-size: 10.5px; color: var(--cc-ink-70); line-height: 1.6;` — texte tronqué en CSS via `display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;` (3 lignes max, pas de gestion JS de la troncature).
- `.mock-contact` : `display: flex; flex-direction: column; gap: 6px;`
- `.mock-contact-row` : `display: flex; justify-content: space-between; gap: 8px; font-size: 10px; padding: 6px 0; border-bottom: 1px solid var(--cc-line);` (dernière ligne sans bordure, via `:last-child`).
- `.mock-contact-row .k` (clé) : `color: var(--cc-ink-45); text-transform: uppercase; letter-spacing: .04em;`
- `.mock-contact-row .v` (valeur) : `color: var(--cc-ink); text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 60%;`

### Nouvelles fonctions JS

```js
function syncAboutPreview() {
    document.getElementById('mock-about-title').textContent = document.getElementById('about-title').value;
    document.getElementById('mock-about-text').textContent = document.getElementById('about-p1').value;
}

function syncContactPreview() {
    const el = document.getElementById('mock-contact');
    if (!el) return;
    const rows = [
        ['Email', document.getElementById('contact-email').value],
        ['Lieu', document.getElementById('contact-location').value],
    ];
    el.innerHTML = rows.map(([k, v]) => `
        <div class="mock-contact-row">
          <span class="k">${escapeHtml(k)}</span>
          <span class="v">${escapeHtml(v || '—')}</span>
        </div>`).join('');
}
```

(GitHub/LinkedIn ne sont pas repris dans l'aperçu — ce sont des liens, pas du contenu éditorial visible en un coup d'œil ; email + lieu suffisent à donner une idée fidèle de la section.)

### Câblage

- `fillAboutForm()` : ajouter l'appel `syncAboutPreview();` à la toute fin (même emplacement que `syncHeroPreview()` dans `fillGeneralForm()`).
- `fillContactForm()` : ajouter l'appel `syncContactPreview();` à la toute fin.
- Dans `loadData()`, à côté de la ligne existante `document.getElementById('form-general').addEventListener('input', syncHeroPreview);`, ajouter :
  ```js
  document.getElementById('form-about').addEventListener('input', syncAboutPreview);
  document.getElementById('form-contact').addEventListener('input', syncContactPreview);
  ```

### Mise à jour du texte d'aide

`.preview-note` : remplacer `"Reflète en direct l'onglet « Général », et les listes « Compétences » / « Projets » à mesure que vous les modifiez ou réordonnez."` par `"Reflète en direct les onglets « Général », « À propos », « Compétences », « Projets » et « Contact » à mesure que vous les modifiez."`.

## 3. Sélecteur d'icône pour les catégories de compétences

### État actuel

Dans le générateur `renderSkillsEditor()` (`dashboard.html`, section skills), chaque catégorie a un `<input type="text">` avec le label "Icône Google Material (ex: database, code)" et `onchange="updateCategoryIcon(catIdx, this.value)"`.

### Cible

Charger `js/icons.js` dans `dashboard.html` via un `<script src="js/icons.js"></script>` ajouté avant le `<script>` inline existant (même source de vérité que le site public — évite toute dérive si les icônes changent un jour).

Remplacer le champ texte par un groupe de 4 boutons-icônes (pas un `<select>` HTML natif — un `<select>` ne peut pas afficher un SVG par option de façon fiable multi-navigateurs ; un groupe de boutons cliquables est plus simple et plus lisible) :

```html
<div class="icon-picker" data-cat="${catIdx}">
  ${['palette', 'database', 'smartphone', 'star'].map(name => `
    <button type="button"
            class="icon-picker-btn${cat.icon === name ? ' active' : ''}"
            onclick="updateCategoryIcon(${catIdx}, '${name}')"
            title="${name}">
      ${renderIcon(name)}
    </button>
  `).join('')}
</div>
```

Ce bloc remplace l'`<input>` texte existant dans le HTML généré par `renderSkillsEditor()`. Le label au-dessus ("Icône de la catégorie") reste, mais le sous-texte d'aide "(ex: database, code)" disparaît (il n'a plus lieu d'être, le choix est maintenant visuel).

`updateCategoryIcon(catIdx, val)` (corps actuel confirmé : `PORTFOLIO_DATA.skills[catIdx].icon = val;`, aucun re-render) doit gagner un appel `renderSkillsEditor();` à la fin, pour que la classe `.active` du sélecteur reflète immédiatement le nouveau choix — exactement le même schéma que `addSkillCategory()`/`deleteSkillCategory()`, qui appellent déjà `renderSkillsEditor()` après une mutation structurelle. (Contrairement à `updateCategoryName`, qui ne re-render pas parce que c'est un champ texte en cours de frappe — un re-render y volerait le focus ; ce risque n'existe pas ici, un bouton-icône ne garde pas le focus texte entre deux clics.)

### Nouveau CSS

```css
.icon-picker {
  display: flex;
  gap: 8px;
}
.icon-picker-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color .15s, color .15s;
}
.icon-picker-btn:hover {
  color: var(--text-primary);
}
.icon-picker-btn.active {
  border-color: var(--primary-container);
  color: var(--primary-container);
}
.icon-picker-btn svg {
  width: 18px;
  height: 18px;
}
```

(Ces couleurs utilisent les tokens **du dashboard** — `--border-color`, `--text-muted`, `--primary-container` — pas les tokens Carte Céleste : ce sélecteur est un contrôle d'interface du dashboard, pas une reproduction du site, contrairement au panneau Aperçu live du point 1-2.)

## 4. Correction du bug de scroll-reveal après édition live

### Diagnostic confirmé (vérifié dans le code actuel, `js/app.js`)

- Ligne ~607 : `const revealObserver = new IntersectionObserver(...)` est déclaré à l'intérieur du bloc `if (!prefersReducedMotion) { ... }`.
- Ligne ~473 : `renderAll()` (fonction séparée, définie plus haut dans le fichier) contient `if (typeof revealObserver !== 'undefined' && revealObserver) { document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element)); }` — cette référence ne peut jamais voir la déclaration du bloc `if`, `revealObserver` est structurellement hors de portée.
- Effet concret : après qu'un `storage` event du dashboard déclenche `renderAll()` (édition live), les nouveaux éléments `.reveal` ajoutés par `document.querySelectorAll('.reveal')` (utilisés depuis la passe Task 10 de la refonte Carte Céleste sur Hero/À propos/Compétences/Projets/Contact) ne sont jamais re-observés → ils restent à `opacity: 0` en permanence après une édition live.

### Correction

Sortir la déclaration de `revealObserver` du bloc `if (!prefersReducedMotion)` vers la portée de la fonction englobante (le callback `DOMContentLoaded`), en la déclarant avec `let` avant le bloc et en l'assignant à l'intérieur :

```js
let revealObserver = null;
if (!prefersReducedMotion) {
    const revealObserverOptions = { /* inchangé */ };
    revealObserver = new IntersectionObserver((entries, observer) => {
        /* inchangé */
    }, revealObserverOptions);
    document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
}
```

Ne rien changer côté `renderAll()` — son check `typeof revealObserver !== 'undefined' && revealObserver` fonctionne déjà correctement une fois `revealObserver` réellement visible depuis la portée englobante (il vaudra `null` si `prefersReducedMotion` est vrai, ce qui fait échouer le `&&` proprement, sans erreur).

### Vérification

Test manuel : ouvrir le site public dans un onglet, le dashboard dans un autre (même navigateur, pour partager `localStorage`), faire une modification dans le dashboard avec l'aperçu live actif, confirmer via `storage` event que `renderAll()` s'exécute sur le site public, puis scroller une section qui n'était pas encore révélée avant l'édition et confirmer qu'elle apparaît toujours (au lieu de rester invisible). Vérifier aussi qu'aucune erreur console n'apparaît.

## Identifiants concernés (contrat à préserver)

Aucun `id` existant n'est renommé. Nouveaux `id` introduits : `mock-about-title`, `mock-about-text`, `mock-contact`. Nouvelle classe : `mock-about`, `mock-about-title`, `mock-about-text`, `mock-contact`, `mock-contact-row`, `icon-picker`, `icon-picker-btn`.

## Hors-scope — rappel

- Pas de changement à `js/portfolio-data.js`.
- Pas de changement à l'authentification (`server.js`, `.env`).
- Pas de changement à l'identité visuelle propre du dashboard (nav rail, palette de commandes, `:root` tokens du dashboard).
- Pas de nouvelle fonctionnalité au-delà des 4 points ci-dessus.
