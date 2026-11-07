// Le lecteur PDF.js est copié dans public/vendor/pdfjs/ (Vercel sert public/ tel quel).
// Ces tests empêchent que la copie diverge de la version figée dans package.json,
// par exemple après une mise à jour de pdfjs-dist sans relancer `npm run vendor:pdfjs`.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const vendor = path.join(root, 'public', 'vendor', 'pdfjs');

test('pdfjs-dist est figé sur une version exacte', () => {
  const version = pkg.devDependencies['pdfjs-dist'];
  assert.match(version, /^\d+\.\d+\.\d+$/, `version non figée : ${version}`);
});

test('la copie de PDF.js dans public/ correspond à la version de package.json', () => {
  const version = pkg.devDependencies['pdfjs-dist'];
  for (const file of ['pdf.min.mjs', 'pdf.worker.min.mjs']) {
    const content = fs.readFileSync(path.join(vendor, file), 'utf8');
    assert.ok(content.includes(`"${version}"`), `${file} ne contient pas la version ${version} : lancez npm run vendor:pdfjs`);
  }
  assert.ok(fs.readdirSync(path.join(vendor, 'standard_fonts')).length > 0, 'polices standard manquantes');
});

test('le lecteur désactive l’évaluation de code (compatible avec la CSP script-src self)', () => {
  const viewer = fs.readFileSync(path.join(root, 'public', 'js', 'cv-viewer.js'), 'utf8');
  assert.match(viewer, /isEvalSupported:\s*false/);
});
