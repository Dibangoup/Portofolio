// Tests de l'envoi du CV en PDF et de la publication GitHub.
// Lancement : npm test
//
// Aucun test n'appelle /api/save avec des données valides : cette route réécrirait le vrai
// js/portfolio-data.js. Les tests de publication utilisent un faux `git`, donc aucun commit
// ni push réel n'est fait.

const { test, describe, before, after, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

process.env.DASHBOARD_USER = 'admin';
process.env.DASHBOARD_PASSWORD = 'test-password-123';

const { app, isPdfBuffer, publishToGit, CV_MAX_BYTES } = require('../server.js');

const PDF = Buffer.from('%PDF-1.4\n%contenu de test\n%%EOF\n', 'latin1');
const NOT_PDF = Buffer.from('\x89PNG\r\n\x1a\n0000', 'latin1');
const AUTH = 'Basic ' + Buffer.from('admin:test-password-123').toString('base64');
const CV_DIR = path.join(__dirname, '..', 'public', 'cv');
const DATA_FILE = path.join(__dirname, '..', 'public', 'js', 'portfolio-data.js');
const DATA = ['public/js/portfolio-data.js'];

describe('isPdfBuffer', () => {
  test('accepte un fichier qui commence par %PDF-', () => {
    assert.equal(isPdfBuffer(PDF), true);
  });
  test('refuse un autre format (PNG)', () => {
    assert.equal(isPdfBuffer(NOT_PDF), false);
  });
  test('refuse un tampon vide ou trop court', () => {
    assert.equal(isPdfBuffer(Buffer.alloc(0)), false);
    assert.equal(isPdfBuffer(Buffer.from('%PD')), false);
  });
  test('refuse ce qui n’est pas un tampon', () => {
    assert.equal(isPdfBuffer('%PDF-1.4'), false);
    assert.equal(isPdfBuffer(undefined), false);
  });
});

// Faux git : enregistre les appels et répond selon le scénario du test.
function fakeGit({
  branch = 'main',
  stagedBefore = '',
  stagedAfter = 'public/js/portfolio-data.js',
  unpushed = '0',
  commitError = null,
  pushError = null,
} = {}) {
  const calls = [];
  let stagedCalls = 0;
  const git = async (args) => {
    calls.push(args.join(' '));
    if (args[0] === 'ls-files') return '';
    if (args[0] === 'rev-parse') return branch;
    if (args[0] === 'rev-list') return unpushed;
    if (args[0] === 'diff') {
      stagedCalls += 1;
      return stagedCalls === 1 ? stagedBefore : stagedAfter;
    }
    if (args[0] === 'commit' && commitError) throw Object.assign(new Error('commit'), { stderr: commitError });
    if (args[0] === 'push' && pushError) throw Object.assign(new Error('push'), { stderr: pushError });
    return '';
  };
  return { git, calls };
}

describe('publishToGit', () => {
  // Restaure la variable même si une assertion échoue, pour ne pas fausser les tests suivants.
  const initial = process.env.GIT_AUTO_PUBLISH;
  afterEach(() => {
    if (initial === undefined) delete process.env.GIT_AUTO_PUBLISH;
    else process.env.GIT_AUTO_PUBLISH = initial;
  });

  test('ne fait rien sans GIT_AUTO_PUBLISH=true', async () => {
    process.env.GIT_AUTO_PUBLISH = 'false';
    const fake = fakeGit();
    const r = await publishToGit(DATA, 'msg', fake.git);
    assert.equal(r.published, false);
    assert.equal(fake.calls.length, 0);
  });

  test('refuse une branche autre que main', async () => {
    process.env.GIT_AUTO_PUBLISH = 'true';
    const fake = fakeGit({ branch: 'feature-x' });
    const r = await publishToGit(DATA, 'msg', fake.git);
    assert.equal(r.published, false);
    assert.ok(!fake.calls.some((c) => c.startsWith('add')), 'rien ne doit être ajouté');
  });

  test('refuse si des fichiers sont déjà préparés dans Git', async () => {
    process.env.GIT_AUTO_PUBLISH = 'true';
    const fake = fakeGit({ stagedBefore: 'autre-fichier.js' });
    const r = await publishToGit(DATA, 'msg', fake.git);
    assert.equal(r.published, false);
    assert.ok(!fake.calls.some((c) => c.startsWith('add')), 'rien ne doit être ajouté');
  });

  test('refuse si des commits locaux ne sont pas encore poussés (ne les publie pas en douce)', async () => {
    process.env.GIT_AUTO_PUBLISH = 'true';
    const fake = fakeGit({ unpushed: '2' });
    const r = await publishToGit(DATA, 'msg', fake.git);
    assert.equal(r.published, false);
    assert.match(r.reason, /2 commit/);
    assert.ok(!fake.calls.some((c) => c.startsWith('add') || c.startsWith('push')));
  });

  test('ajoute seulement les chemins listés, commit puis push sur main', async () => {
    process.env.GIT_AUTO_PUBLISH = 'true';
    const fake = fakeGit();
    const r = await publishToGit([...DATA, 'public/cv'], 'mon message', fake.git);
    assert.deepEqual(r, { published: true, changed: true });
    const addCall = fake.calls.find((c) => c.startsWith('add'));
    // public/cv n'existe pas forcément dans l'environnement de test : seul le fichier de
    // données est garanti. On vérifie que rien d'autre que les chemins listés n'est ajouté.
    assert.ok(addCall.startsWith('add -A -- public/js/portfolio-data.js'), addCall);
    assert.ok(!addCall.includes('server.js') && !addCall.includes('.vscode') && !addCall.includes('.env'), addCall);
    assert.ok(fake.calls.indexOf('commit -m mon message') > fake.calls.indexOf(addCall));
    assert.equal(fake.calls.at(-1), 'push origin main');
  });

  test('ne commit pas quand rien n’a changé', async () => {
    process.env.GIT_AUTO_PUBLISH = 'true';
    const fake = fakeGit({ stagedAfter: '' });
    const r = await publishToGit(DATA, 'msg', fake.git);
    assert.deepEqual(r, { published: true, changed: false });
    assert.ok(!fake.calls.some((c) => c.startsWith('commit')));
  });

  test('un commit raté retire les fichiers de l’index et ne pousse rien', async () => {
    process.env.GIT_AUTO_PUBLISH = 'true';
    const fake = fakeGit({ commitError: 'Author identity unknown\nfatal: unable to auto-detect email address' });
    const r = await publishToGit(DATA, 'msg', fake.git);
    assert.equal(r.published, false);
    assert.match(r.reason, /fatal: unable to auto-detect email address/);
    assert.ok(fake.calls.includes('reset -q -- public/js/portfolio-data.js'), fake.calls.join(' | '));
    assert.ok(!fake.calls.some((c) => c.startsWith('push')));
  });

  test('un push refusé est signalé avec la vraie raison (pas la ligne « To … »)', async () => {
    process.env.GIT_AUTO_PUBLISH = 'true';
    // Format réel de git : la ligne « To <url> » vient avant le refus.
    const stderr = 'To https://github.com/exemple/depot.git\n ! [rejected]        main -> main (fetch first)\nerror: failed to push some refs to \'https://github.com/exemple/depot.git\'\n';
    const fake = fakeGit({ pushError: stderr });
    const r = await publishToGit(DATA, 'msg', fake.git);
    assert.equal(r.published, false);
    assert.equal(r.committed, true);
    assert.match(r.reason, /\[rejected\]/);
    assert.doesNotMatch(r.reason, /To https/);
  });
});

describe('routes CV', () => {
  let server;
  let base;

  before(() => new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      base = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  }));
  after(() => new Promise((resolve) => server.close(resolve)));

  const uploadHeaders = { 'Content-Type': 'application/pdf', Authorization: AUTH, 'X-Dashboard-Request': '1' };
  const saveHeaders = { 'Content-Type': 'application/json', Authorization: AUTH, 'X-Dashboard-Request': '1' };

  // Les routes de sauvegarde testées ici doivent refuser AVANT d'écrire : on le vérifie.
  async function saveExpectingNoWrite(body) {
    const before = fs.readFileSync(DATA_FILE);
    const mtimeBefore = fs.statSync(DATA_FILE).mtimeMs;
    const res = await fetch(base + '/api/save', { method: 'POST', headers: saveHeaders, body: JSON.stringify(body) });
    assert.equal(fs.statSync(DATA_FILE).mtimeMs, mtimeBefore, 'le fichier de données ne doit pas être réécrit');
    assert.deepEqual(fs.readFileSync(DATA_FILE), before);
    return res;
  }

  test('POST /api/cv refuse sans authentification', async () => {
    const res = await fetch(base + '/api/cv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/pdf', 'X-Dashboard-Request': '1' },
      body: PDF,
    });
    assert.equal(res.status, 401);
  });

  test('POST /api/cv refuse sans en-tête personnalisé (protection CSRF)', async () => {
    const res = await fetch(base + '/api/cv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/pdf', Authorization: AUTH },
      body: PDF,
    });
    assert.equal(res.status, 403);
  });

  test('POST /api/cv refuse un fichier dont le contenu n’est pas un PDF', async () => {
    const res = await fetch(base + '/api/cv', { method: 'POST', headers: uploadHeaders, body: NOT_PDF });
    assert.equal(res.status, 400);
  });

  test('POST /api/cv refuse un fichier trop lourd', async () => {
    const res = await fetch(base + '/api/cv', { method: 'POST', headers: uploadHeaders, body: Buffer.alloc(CV_MAX_BYTES + 1, 0x25) });
    assert.equal(res.status, 413);
  });

  test('POST /api/cv accepte un vrai PDF, le renomme et le stocke', async () => {
    const res = await fetch(base + '/api/cv', { method: 'POST', headers: uploadHeaders, body: PDF });
    assert.equal(res.status, 200);
    const { url } = await res.json();
    assert.match(url, /^\/cv\/cv-[a-f0-9]{16}\.pdf$/);
    const stored = path.join(CV_DIR, path.basename(url));
    try {
      assert.deepEqual(fs.readFileSync(stored), PDF);
    } finally {
      fs.rmSync(stored, { force: true });
    }
  });

  test('POST /api/save refuse un lien PDF qui sort du dossier cv, sans rien écrire', async () => {
    const res = await saveExpectingNoWrite({ cv: { pdfUrl: '/cv/../../server.js' } });
    assert.equal(res.status, 400);
  });

  test('POST /api/save refuse un lien PDF qui n’est pas du texte (tableau), sans rien écrire', async () => {
    const res = await saveExpectingNoWrite({ cv: { pdfUrl: ['/cv/cv-0123456789abcdef.pdf'] } });
    assert.equal(res.status, 400);
  });

  test('POST /api/save refuse un lien vers un PDF qui n’existe plus, sans rien écrire', async () => {
    const res = await saveExpectingNoWrite({ cv: { pdfUrl: '/cv/cv-0000000000000000.pdf' } });
    assert.equal(res.status, 409);
  });

  test('POST /api/save sans authentification répond 401 avant de lire le corps', async () => {
    // JSON volontairement invalide : s'il était lu avant l'authentification, on aurait un 400.
    const res = await fetch(base + '/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Dashboard-Request': '1' },
      body: '{pas du json',
    });
    assert.equal(res.status, 401);
  });

  test('un JSON mal formé reçoit un message générique, sans trace d’erreur', async () => {
    const before = fs.readFileSync(DATA_FILE);
    const res = await fetch(base + '/api/save', { method: 'POST', headers: saveHeaders, body: '{pas du json' });
    const text = await res.text();
    assert.equal(res.status, 400);
    assert.deepEqual(JSON.parse(text), { error: 'Requête invalide.' });
    assert.doesNotMatch(text, /SyntaxError|at .*\.js|node_modules/);
    assert.deepEqual(fs.readFileSync(DATA_FILE), before);
  });
});

describe('en-têtes de sécurité Vercel', () => {
  test('vercel.json applique la même CSP que le serveur local (aucune divergence)', async () => {
    const vercel = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'vercel.json'), 'utf8'));
    const all = vercel.headers.find((h) => h.source === '/(.*)');
    assert.ok(all, 'une règle /(.*) doit exister');
    const get = (key) => all.headers.find((h) => h.key === key)?.value;

    const server = app.listen(0, '127.0.0.1');
    await new Promise((resolve) => server.once('listening', resolve));
    try {
      const res = await fetch(`http://127.0.0.1:${server.address().port}/`);
      assert.equal(get('Content-Security-Policy'), res.headers.get('content-security-policy'));
      assert.equal(get('X-Content-Type-Options'), 'nosniff');
      assert.equal(get('X-Frame-Options'), res.headers.get('x-frame-options'));
      assert.equal(get('Referrer-Policy'), res.headers.get('referrer-policy'));
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});
