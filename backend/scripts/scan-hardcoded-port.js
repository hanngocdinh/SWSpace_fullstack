#!/usr/bin/env node
/**
 * Scan repository for hardcoded 'localhost:3001' occurrences.
 * Exit code 1 if any found, list files and line numbers.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const target = 'localhost:3001';
const ignoreDirs = new Set(['node_modules', '.git', 'dist', 'build']);
// We exclude .md to avoid README documentation references triggering false positives.
const exts = new Set(['.js', '.jsx', '.ts', '.tsx', '.json', '.css']);
let hits = [];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  lines.forEach((line, idx) => {
    if (line.includes(target)) {
      // Ignore this scanner file itself
      if (filePath.endsWith('scan-hardcoded-port.js')) return;
      hits.push({ file: path.relative(root, filePath), line: idx + 1, text: line.trim() });
    }
  });
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (ignoreDirs.has(entry)) continue;
      walk(full);
    } else {
      const ext = path.extname(entry);
      if (exts.has(ext)) scanFile(full);
    }
  }
}

walk(root);
if (hits.length) {
  console.error(`❌ Found ${hits.length} occurrence(s) of '${target}':`);
  hits.forEach(h => console.error(` - ${h.file}:${h.line} :: ${h.text}`));
  process.exit(1);
} else {
  console.log('✅ No hardcoded localhost:3001 found.');
}
