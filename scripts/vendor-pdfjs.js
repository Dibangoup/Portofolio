// Copie le lecteur PDF.js (version figée dans package.json) dans public/vendor/pdfjs/.
// Vercel sert public/ tel quel, sans étape de construction : ces fichiers sont donc commités.
// À relancer après une mise à jour de pdfjs-dist : npm run vendor:pdfjs
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'node_modules', 'pdfjs-dist');
const dest = path.join(__dirname, '..', 'public', 'vendor', 'pdfjs');

const files = [
  ['build/pdf.min.mjs', 'pdf.min.mjs'],
  ['build/pdf.worker.min.mjs', 'pdf.worker.min.mjs'],
  ['LICENSE', 'LICENSE'],
];

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(path.join(dest, 'standard_fonts'), { recursive: true });

for (const [from, to] of files) {
  fs.copyFileSync(path.join(src, from), path.join(dest, to));
}
// Polices standard : nécessaires quand un PDF utilise une police de base non intégrée.
for (const f of fs.readdirSync(path.join(src, 'standard_fonts'))) {
  fs.copyFileSync(path.join(src, 'standard_fonts', f), path.join(dest, 'standard_fonts', f));
}

const { version } = require(path.join(src, 'package.json'));
console.log(`PDF.js ${version} copié dans public/vendor/pdfjs/`);
