#!/usr/bin/env node
// Stampa a video il contenuto dei file Apache .conf presenti nella cartella target
// Uso: node tools/print-apache-conf.cjs [cartella]

const fs = require('fs');
const path = require('path');

const root = path.resolve(process.argv[2] || process.cwd());

function walk(dir, acc) {
  let entries = [];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      // ignora node_modules e .git per velocità
      if (e.name === 'node_modules' || e.name === '.git') continue;
      walk(p, acc);
    } else if (e.isFile()) {
      const lower = e.name.toLowerCase();
      if (lower.endsWith('.conf')) acc.push(p);
    }
  }
  return acc;
}

const files = walk(root, [])
  .filter(f => /apache|vhost|httpd|ssl|zanellazen/i.test(path.basename(f)) || f.toLowerCase().endsWith('.conf'))
  .sort();

if (files.length === 0) {
  console.log('Nessun file .conf trovato in', root);
  process.exit(0);
}

for (const f of files) {
  let content = '';
  try { content = fs.readFileSync(f, 'utf8'); } catch (e) {
    content = '[ERRORE LETTURA] ' + e.message;
  }
  console.log('===== FILE:', path.relative(root, f));
  console.log(content);
  if (!content.endsWith('\n')) console.log();
  console.log('===== FINE FILE:', path.relative(root, f));
  console.log();
}

