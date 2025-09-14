#!/usr/bin/env node
// Update href/src/url() references after files have been moved
// Usage:
//   node tools/update-links.mjs [--write] [--mapping path-map.json] [--exts ".html,.htm,.ejs,.pug,.njk,.css,.scss,.less,.js,.ts,.jsx,.tsx"] [--verbose]
// Notes:
// - Dry-run by default; add --write to modify files.
// - Optionally provide a mapping file to rewrite known prefixes.
// - Tries to auto-resolve by matching filenames if mapping not sufficient.

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
const write = Boolean(args.get('write') || false);
const verbose = Boolean(args.get('verbose') || false);
const mappingPath = args.get('mapping') ? path.resolve(String(args.get('mapping'))) : null;
const extsArg = args.get('exts');
const exts = (extsArg ? String(extsArg) : '.html,.htm,.ejs,.pug,.njk,.css,.scss,.less,.js,.ts,.jsx,.tsx')
  .split(',')
  .map(s => s.trim().toLowerCase())
  .filter(Boolean);

const ignoreDirs = new Set([
  'node_modules', '.git', 'dist', 'build', 'coverage', '.next', 'out', 'tmp', 'temp', '.cache'
]);

function toPosix(p) {
  return p.split('\\').join('/');
}

async function* walk(dir) {
  let entries;
  try {
    entries = await fsp.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (e.name.startsWith('.linkfix')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (ignoreDirs.has(e.name)) continue;
      yield* walk(full);
    } else if (e.isFile()) {
      yield full;
    }
  }
}

function isHttpLike(s) {
  return /^(?:https?:)?\/\//i.test(s);
}
function isDataLike(s) {
  return /^(?:data:|mailto:|tel:|javascript:)/i.test(s);
}
function isAnchorOnly(s) {
  return /^#/.test(s);
}

function loadMapping(p) {
  if (!p) return null;
  try {
    const raw = fs.readFileSync(p, 'utf8');
    const json = JSON.parse(raw);
    // Supported forms:
    // { "pathPrefixMap": { "old/": "new/", ... } }
    // or array of { from: "old/", to: "new/" }
    const map = [];
    if (Array.isArray(json)) {
      for (const r of json) if (r && r.from && r.to) map.push({ from: String(r.from), to: String(r.to) });
    } else if (json && typeof json === 'object' && json.pathPrefixMap && typeof json.pathPrefixMap === 'object') {
      for (const [from, to] of Object.entries(json.pathPrefixMap)) map.push({ from: String(from), to: String(to) });
    } else if (json && typeof json === 'object') {
      for (const [from, to] of Object.entries(json)) map.push({ from: String(from), to: String(to) });
    }
    // Sort longest 'from' first to avoid partial overlaps
    map.sort((a, b) => b.from.length - a.from.length);
    return map;
  } catch (e) {
    console.error('Failed to load mapping file:', p, e.message);
    return null;
  }
}

function applyMapping(original, rules) {
  if (!rules || rules.length === 0) return null;
  for (const { from, to } of rules) {
    if (original.startsWith(from)) return original.replace(from, to);
    // Also try with no leading './'
    if (original.startsWith('./') && from && !from.startsWith('./') && ('./' + from) !== from) {
      if (original.startsWith('./' + from)) return original.replace('./' + from, to.startsWith('./') ? to : './' + to);
    }
  }
  return null;
}

function buildIndex(files) {
  const byName = new Map();
  for (const f of files) {
    const base = path.basename(f).toLowerCase();
    if (!byName.has(base)) byName.set(base, []);
    byName.get(base).push(f);
  }
  return byName;
}

function scoreCandidate(candidatePath, origPath) {
  // Simple heuristic: more matching path segments -> higher score
  const candPosix = toPosix(candidatePath).toLowerCase();
  const origPosix = toPosix(origPath).toLowerCase();
  const parts = origPosix.split('/').filter(Boolean);
  let score = 0;
  for (const p of parts) if (p && candPosix.includes(p)) score += Math.min(3, p.length);
  // Prefer when directory segment matches the first segment (e.g., css/, js/)
  const firstSeg = parts[0];
  if (firstSeg === 'css' && /\/css\//.test(candPosix)) score += 10;
  if (firstSeg === 'js' && /\/js\//.test(candPosix)) score += 10;
  if (firstSeg === 'images' && /\/images\//.test(candPosix)) score += 5;
  // Prefer assets-like directories a bit
  if (/\/assets\//i.test(candPosix)) score += 1;
  return score;
}

async function fileExists(p) {
  try { await fsp.access(p, fs.constants.F_OK); return true; } catch { return false; }
}

async function main() {
  const allFiles = [];
  for await (const f of walk(repoRoot)) allFiles.push(f);

  const textFiles = allFiles.filter(f => exts.includes(path.extname(f).toLowerCase()));
  const index = buildIndex(allFiles);
  const mapping = loadMapping(mappingPath);

  if (verbose) {
    console.log(`Found ${allFiles.length} files, scanning ${textFiles.length} target files`);
    if (mapping) console.log(`Using mapping rules from ${mappingPath}`);
  }

  const backupRoot = path.join(repoRoot, '.linkfix', 'backups');
  if (write) await fsp.mkdir(backupRoot, { recursive: true }).catch(() => {});

  let totalChanges = 0;
  let changedFiles = 0;

  for (const file of textFiles) {
    const ext = path.extname(file).toLowerCase();
    const dir = path.dirname(file);
    const originalText = await fsp.readFile(file, 'utf8');
    let text = originalText;
    const replacements = [];

    // Define patterns per file type
    const patterns = [];
    if (['.html', '.htm', '.ejs', '.pug', '.njk'].includes(ext)) {
      // Attributes like href/src/action/poster/content/meta refresh
      patterns.push(/\b(href|src|action|poster|data-[a-zA-Z-]*?(?:src|href)|content)=(['"])([^'"#][^'">]*)\2/g);
    }
    if (['.css', '.scss', '.less', '.html', '.htm', '.ejs', '.pug', '.njk'].includes(ext)) {
      // CSS url()
      patterns.push(/url\((['"]?)([^"')#][^"')]*)\1\)/g);
    }
    if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) {
      // import/require/fetch
      patterns.push(/\bfrom\s+['"]([^'"#][^'";]*)['"];?/g);
      patterns.push(/\brequire\(\s*['"]([^'"#][^'";]*)['"]\s*\)/g);
      patterns.push(/\bfetch\(\s*['"]([^'"#][^'";]*)['"]\s*\)/g);
    }

    async function* collectMatches(regex, groupIndex = 3) {
      let m;
      while ((m = regex.exec(text)) !== null) {
        const full = m[0];
        // Determine group that contains the path based on regex used
        let pathValue;
        if (regex === patterns[0] && ['.html', '.htm', '.ejs', '.pug', '.njk'].includes(ext)) {
          pathValue = m[3];
        } else if (full.startsWith('url(')) {
          pathValue = m[2];
        } else {
          pathValue = m[1];
        }
        const start = m.index + full.indexOf(pathValue);
        const end = start + pathValue.length;
        yield { pathValue, start, end };
      }
    }

    // Utility to compute replacement
    async function resolveNewPath(oldRel) {
      const candidateMapping = applyMapping(oldRel, mapping);
      if (candidateMapping) return candidateMapping;
      if (isHttpLike(oldRel) || isDataLike(oldRel) || isAnchorOnly(oldRel)) return null;

      // If the path already exists relative to the file, keep it
      const absCandidate = path.resolve(dir, oldRel);
      if (await fileExists(absCandidate)) return null;

      // If it starts with '/', try from repo root
      if (oldRel.startsWith('/')) {
        const rootCandidate = path.join(repoRoot, oldRel);
        if (await fileExists(rootCandidate)) return null;
      }

      // Try filename-based resolution
      const base = path.basename(oldRel).toLowerCase();
      const candidates = index.get(base) || [];
      if (candidates.length === 0) return null;
      if (candidates.length === 1) {
        const rel = toPosix(path.relative(dir, candidates[0]));
        return rel.startsWith('.') ? rel : './' + rel;
      }
      // Multiple candidates: score
      let best = null;
      let bestScore = -Infinity;
      for (const c of candidates) {
        const s = scoreCandidate(c, oldRel);
        if (s > bestScore) { bestScore = s; best = c; }
      }
      if (best) {
        const rel = toPosix(path.relative(dir, best));
        return rel.startsWith('.') ? rel : './' + rel;
      }
      return null;
    }

    // Iterate patterns and collect edits
    for (const regex of patterns) {
      for await (const match of collectMatches(regex)) {
        const oldPath = match.pathValue.trim();
        const newPath = await resolveNewPath(oldPath);
        if (newPath && newPath !== oldPath) {
          replacements.push({ start: match.start, end: match.end, oldPath, newPath });
        }
      }
    }

    if (replacements.length > 0) {
      // Apply replacements from end to start to avoid offset shifts
      replacements.sort((a, b) => b.start - a.start);
      let modified = text;
      for (const r of replacements) {
        modified = modified.slice(0, r.start) + r.newPath + modified.slice(r.end);
      }
      const relFile = path.relative(repoRoot, file);
      console.log(`${write ? 'UPDATED' : 'WOULD UPDATE'} ${relFile} (${replacements.length} changes)`);
      if (verbose) {
        for (const r of replacements.slice(0, 5)) {
          console.log(`  ${r.oldPath} -> ${r.newPath}`);
        }
        if (replacements.length > 5) console.log(`  ...and ${replacements.length - 5} more`);
      }
      if (write) {
        // backup
        const backupPath = path.join(backupRoot, relFile);
        await fsp.mkdir(path.dirname(backupPath), { recursive: true }).catch(() => {});
        await fsp.writeFile(backupPath, originalText, 'utf8');
        await fsp.writeFile(file, modified, 'utf8');
      }
      totalChanges += replacements.length;
      changedFiles += 1;
    }
  }

  console.log(`${write ? 'Applied' : 'Planned'} ${totalChanges} changes across ${changedFiles} files.`);
  if (!write) console.log('Run again with --write to apply changes.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
