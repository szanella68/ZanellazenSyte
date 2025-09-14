#!/usr/bin/env node
// Map links in Home and Menu to their new locations
// Outputs a Markdown table with: Context, Ref file, Attr, Current, Suggested, FoundAbs, Status, Notes

import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const args = new Map();
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.includes('=') ? a.split('=') : [a, null];
      const key = k.replace(/^--/, '');
      if (v !== null) args.set(key, v);
      else if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) args.set(key, argv[++i]);
      else args.set(key, true);
    }
  }
  return args;
}

const args = parseArgs(process.argv);
const homePathArg = args.get('home') ? path.resolve(String(args.get('home'))) : null;
const menuPathArg = args.get('menu') ? String(args.get('menu')) : null; // may be comma-separated
const outPath = args.get('out') ? path.resolve(String(args.get('out'))) : path.join(repoRoot, 'reports', 'home-menu-link-map.md');
const verbose = Boolean(args.get('verbose') || false);

const ignoreDirs = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', '.next', 'out', 'tmp', 'temp', '.cache']);

async function* walk(dir) {
  let entries;
  try { entries = await fsp.readdir(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (ignoreDirs.has(e.name)) continue;
      yield* walk(full);
    } else if (e.isFile()) {
      yield full;
    }
  }
}

async function findCandidates(patterns) {
  const found = [];
  for await (const f of walk(repoRoot)) {
    const rel = path.relative(repoRoot, f);
    for (const p of patterns) {
      if (p.test(rel)) { found.push(f); break; }
    }
  }
  return found;
}

async function guessHome() {
  const preferred = [
    /^index\.(html|htm)$/i,
    /^public\/(?:index|home)\.(html|htm)$/i,
    /^views\/index\.(ejs|pug|njk|html|htm)$/i,
    /^(src|app|pages)\/(?:index|home)\.(html|htm|ejs|pug|njk)$/i
  ];
  const allIndex = [/index\.(html|htm|ejs|pug|njk)$/i];
  let c = await findCandidates(preferred);
  if (c.length > 0) return c[0];
  c = await findCandidates(allIndex);
  return c[0] || null;
}

async function guessMenus() {
  const patterns = [
    /menu\.(html|htm|ejs|pug|njk)$/i,
    /nav\.(html|htm|ejs|pug|njk)$/i,
    /partials\/(menu|nav)\.(html|htm|ejs|pug|njk)$/i,
    /components\/(menu|nav)\.(html|htm|ejs|pug|njk)$/i
  ];
  const c = await findCandidates(patterns);
  // As a fallback, return none; we'll still scan Home
  return c;
}

function isExternal(s) {
  return /^(?:https?:)?\/\//i.test(s) || /^(?:data:|mailto:|tel:|javascript:)/i.test(s);
}
function isAnchor(s) { return /^#/.test(s); }

function extractLinksFromText(text) {
  const results = [];
  // href/src/action/poster and CSS url()
  const attrRe = /\b(href|src|action|poster)=(['"])([^'"#][^'">]*)\2/g;
  const urlRe = /url\((['"]?)([^"')#][^"')]*)\1\)/g;
  let m;
  while ((m = attrRe.exec(text)) !== null) {
    results.push({ attr: m[1], value: m[3] });
  }
  while ((m = urlRe.exec(text)) !== null) {
    results.push({ attr: 'url()', value: m[2] });
  }
  return results;
}

async function indexRepoFiles() {
  const files = [];
  for await (const f of walk(repoRoot)) files.push(f);
  const byBase = new Map();
  for (const f of files) {
    const b = path.basename(f).toLowerCase();
    if (!byBase.has(b)) byBase.set(b, []);
    byBase.get(b).push(f);
  }
  return { files, byBase };
}

async function fileExists(p) {
  try { await fsp.access(p, fs.constants.F_OK); return true; } catch { return false; }
}

function scoreCandidate(candidatePath, origPath) {
  const cand = candidatePath.replace(/\\/g, '/').toLowerCase();
  const parts = origPath.replace(/\\/g, '/').toLowerCase().split('/').filter(Boolean);
  let s = 0;
  for (const p of parts) if (cand.includes(p)) s += Math.min(3, p.length);
  if (/\/assets\//.test(cand)) s += 1;
  return s;
}

async function resolveLink(fromFile, link, index) {
  const dir = path.dirname(fromFile);
  if (isExternal(link) || isAnchor(link)) return { status: 'skip', note: 'external/anchor' };

  // If it exists as-is relative to the file, keep
  const absolute = path.resolve(dir, link);
  if (await fileExists(absolute)) return { status: 'exists', foundAbs: absolute, suggested: link };

  // Absolute-from-root
  if (link.startsWith('/')) {
    const absFromRoot = path.join(repoRoot, link);
    if (await fileExists(absFromRoot)) return { status: 'exists', foundAbs: absFromRoot, suggested: link };
  }

  // Find by basename
  const base = path.basename(link).toLowerCase();
  const candidates = index.byBase.get(base) || [];
  if (candidates.length === 0) return { status: 'missing', note: 'no match by basename' };
  if (candidates.length === 1) {
    const rel = path.relative(dir, candidates[0]).replace(/\\/g, '/');
    const suggested = rel.startsWith('.') ? rel : './' + rel;
    return { status: 'suggest', foundAbs: candidates[0], suggested };
  }
  // Multiple candidates: choose best-scored
  let best = null, bestScore = -Infinity;
  for (const c of candidates) {
    const sc = scoreCandidate(c, link);
    if (sc > bestScore) { bestScore = sc; best = c; }
  }
  if (best) {
    const rel = path.relative(dir, best).replace(/\\/g, '/');
    const suggested = rel.startsWith('.') ? rel : './' + rel;
    return { status: 'suggest', foundAbs: best, suggested, note: `${candidates.length} matches` };
  }
  return { status: 'ambiguous', note: `${candidates.length} matches, none preferred` };
}

function mdEscape(s) {
  return String(s).replace(/\|/g, '\\|');
}

async function main() {
  // Determine home and menu files
  const homeFile = homePathArg || await guessHome();
  const menuFiles = [];
  if (menuPathArg) {
    for (const p of menuPathArg.split(',')) menuFiles.push(path.resolve(p.trim()));
  } else {
    const guessed = await guessMenus();
    for (const g of guessed) menuFiles.push(g);
  }

  if (!homeFile && menuFiles.length === 0) {
    console.error('Unable to guess Home or Menu files. Provide --home and/or --menu paths.');
    process.exit(2);
  }

  const index = await indexRepoFiles();
  const rows = [];

  async function processFile(f, contextName) {
    let text = '';
    try { text = await fsp.readFile(f, 'utf8'); } catch { return; }
    const links = extractLinksFromText(text);
    for (const l of links) {
      const res = await resolveLink(f, l.value, index);
      if (res.status === 'skip') continue;
      rows.push({
        context: contextName,
        refFile: path.relative(repoRoot, f).replace(/\\/g, '/'),
        attr: l.attr,
        current: l.value,
        suggested: res.suggested || '',
        foundAbs: res.foundAbs ? path.relative(repoRoot, res.foundAbs).replace(/\\/g, '/') : '',
        status: res.status,
        notes: res.note || ''
      });
    }
  }

  if (homeFile) {
    if (verbose) console.log('Home:', path.relative(repoRoot, homeFile));
    await processFile(homeFile, 'Home');
  }
  for (const mf of menuFiles) {
    if (verbose) console.log('Menu:', path.relative(repoRoot, mf));
    await processFile(mf, 'Menu');
  }

  // Build Markdown
  let md = '# Mappa Link Home/Menu\n\n';
  md += 'Context | Ref file | Attr | Link attuale | Nuova posizione (rel.) | Nuova posizione (assoluta) | Stato | Note\n';
  md += '---|---|---|---|---|---|---|---\n';
  for (const r of rows) {
    md += `${mdEscape(r.context)} | ${mdEscape(r.refFile)} | ${mdEscape(r.attr)} | ${mdEscape(r.current)} | ${mdEscape(r.suggested)} | ${mdEscape(r.foundAbs)} | ${mdEscape(r.status)} | ${mdEscape(r.notes)}\n`;
  }
  await fsp.mkdir(path.dirname(outPath), { recursive: true }).catch(() => {});
  await fsp.writeFile(outPath, md, 'utf8');
  console.log(`Report written to ${path.relative(repoRoot, outPath).replace(/\\/g, '/')}`);
}

main().catch(err => { console.error(err); process.exit(1); });

