#!/usr/bin/env node
/**
 * Bemora lightweight lint — syntax check for all shipped JS.
 *
 * Runs `node --check` over src/, examples/, tests/ and scripts/.
 * This catches syntax errors, bad imports (parse-time), and accidental
 * non-JS breakage without requiring eslint. Implemented with only
 * readdirSync/statSync so it runs on every supported Node version
 * (18/20/22) — no experimental fs.globSync. Full eslint with style rules
 * is tracked in ROADMAP.md as a future enhancement.
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function walk(dir, out) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, out);
    } else if (full.endsWith('.js')) {
      out.push(path.relative(root, full));
    }
  }
}

const files = [];
for (const d of ['src', 'examples', 'tests', 'scripts']) {
  try {
    walk(path.join(root, d), files);
  } catch {
    /* dir may not exist */
  }
}

if (files.length === 0) {
  console.error('lint: no JS files found');
  process.exit(1);
}

let failures = 0;
for (const f of files.sort()) {
  try {
    execFileSync(process.execPath, ['--check', path.join(root, f)], { stdio: 'pipe' });
  } catch (err) {
    failures += 1;
    const out = (err.stdout?.toString() ?? '') + (err.stderr?.toString() ?? err.message);
    console.error(`FAIL ${f}\n${out}`);
  }
}

if (failures > 0) {
  console.error(`\nlint: ${failures}/${files.length} files failed node --check`);
  process.exit(1);
}
console.log(`lint: OK — ${files.length} files passed node --check`);
