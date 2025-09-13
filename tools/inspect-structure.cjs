#!/usr/bin/env node
/*
  Minimal project inspector for Node/Express apps.
  Usage:
    node tools/inspect-structure.cjs            # current directory
    node tools/inspect-structure.cjs <path>     # target directory
*/
const fs = require('fs');
const path = require('path');

function readJsonSafe(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (_) {
    return null;
  }
}

function exists(p) {
  try { fs.accessSync(p); return true; } catch { return false; }
}

function listDir(p) {
  try { return fs.readdirSync(p, { withFileTypes: true }); } catch { return []; }
}

function firstExisting(base, candidates) {
  for (const c of candidates) {
    const p = path.join(base, c);
    if (exists(p)) return p;
  }
  return null;
}

function parseStartScript(s) {
  if (!s || typeof s !== 'string') return null;
  // crude extraction: look for `node something` or `ts-node something`
  const m = s.match(/(?:node|nodemon|ts-node|tsx)\s+([^\s&;]+)/);
  return m ? m[1] : null;
}

function gather(targetDir) {
  const abs = path.resolve(targetDir);
  const pkgPath = path.join(abs, 'package.json');
  const pkg = readJsonSafe(pkgPath);
  const type = pkg?.type || 'commonjs';
  const scripts = pkg?.scripts || {};
  const deps = Object.assign({}, pkg?.dependencies, pkg?.devDependencies);
  const hasExpress = !!(deps && deps['express']);
  const hasEjs = !!(deps && deps['ejs']);
  const hasPug = !!(deps && deps['pug']);
  const hasHbs = !!(deps && (deps['hbs'] || deps['express-handlebars']));
  const tsconfig = exists(path.join(abs, 'tsconfig.json'));

  const serverCandidates = [];
  if (pkg?.main) serverCandidates.push(pkg.main);
  const fromStart = parseStartScript(scripts.start);
  if (fromStart) serverCandidates.push(fromStart);
  const common = [
    'server.js','app.js','index.js','bin/www',
    path.join('src','server.js'), path.join('src','app.js'), path.join('src','index.js'),
    path.join('src','server.ts'), path.join('src','app.ts'), path.join('src','index.ts')
  ];
  for (const c of common) serverCandidates.push(c);

  const resolvedServers = serverCandidates
    .map(p => path.join(abs, p))
    .filter(p => exists(p));

  const viewsDir = path.join(abs, 'views');
  const publicDir = path.join(abs, 'public');
  const routesDir = path.join(abs, 'routes');

  const views = listDir(viewsDir)
    .filter(d => d.isFile())
    .map(d => d.name);
  const publicTop = listDir(publicDir)
    .map(d => (d.isDirectory()? d.name + '/' : d.name));
  const routes = listDir(routesDir)
    .map(d => d.name);

  const notes = [];
  if (!pkg) notes.push('package.json not found or invalid');
  if (pkg && !hasExpress) notes.push('express not in dependencies');
  if (views.length === 0 && exists(viewsDir)) notes.push('views dir exists but appears empty');
  if (!exists(viewsDir)) notes.push('views dir missing');
  if (!exists(publicDir)) notes.push('public dir missing');
  if (exists(publicDir) && !exists(path.join(publicDir, 'index.html'))) notes.push('public/index.html missing');

  const result = {
    cwd: abs,
    nodeVersion: process.version,
    package: pkg ? {
      name: pkg.name,
      version: pkg.version,
      type,
      main: pkg.main,
      engines: pkg.engines,
      scripts,
      deps: Object.keys(pkg.dependencies || {}),
      devDeps: Object.keys(pkg.devDependencies || {}),
    } : null,
    express: {
      present: hasExpress,
      viewEngines: { ejs: hasEjs, pug: hasPug, hbs: hasHbs }
    },
    ts: { tsconfig },
    structure: {
      serverCandidates: resolvedServers.map(p => path.relative(abs, p)),
      views: exists(viewsDir) ? { dir: 'views', files: views } : null,
      public: exists(publicDir) ? { dir: 'public', top: publicTop } : null,
      routes: exists(routesDir) ? { dir: 'routes', entries: routes } : null,
    },
    notes,
  };

  return result;
}

const target = process.argv[2] || process.cwd();
const info = gather(target);
console.log(JSON.stringify(info, null, 2));

