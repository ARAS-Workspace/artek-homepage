#!/usr/bin/env node
/**
 *  █████╗ ██████╗  █████╗ ███████╗
 * ██╔══██╗██╔══██╗██╔══██╗██╔════╝
 * ███████║██████╔╝███████║███████╗
 * ██╔══██║██╔══██╗██╔══██║╚════██║
 * ██║  ██║██║  ██║██║  ██║███████║
 * ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
 *
 * Copyright (C) 2025 Rıza Emre ARAS <r.emrearas@proton.me>
 *
 * This file is part of ARTEK Homepage.
 *
 * ARTEK Homepage is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * Generate `llms/{tr,en}.txt` for every MDX page by running the
 * agentic-data-builder tool on each page's `index.mdx` / `index.en.mdx`.
 * Route → page directory comes from the router (lib/route-sources.js). Pages
 * with no MDX source (manual pages) are skipped. Re-run whenever page MDX or
 * the builder's rules change; `scripts/build-llms.js` then copies the result
 * into `dist/`.
 *
 * Usage:
 *     node scripts/generate-llms.js
 */

import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { buildRouteMap } from './lib/route-sources.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOOL = path.join(ROOT, 'tools', 'agentic-data-builder', 'bin', 'agentic-data-builder.js');
const log = (m) => console.log(`[gen-llms] ${m}`);

/** Source MDX → output file, per locale. */
const LOCALES = [
  { input: 'index.mdx', output: 'llms/tr.txt' },
  { input: 'index.en.mdx', output: 'llms/en.txt' },
];

if (!existsSync(TOOL)) {
  console.error(`[gen-llms] tool not found: ${TOOL}`);
  process.exit(1);
}

const routes = [...buildRouteMap(path.join(ROOT, 'src/router/index.tsx'), path.join(ROOT, 'src'))].sort(
  (a, b) => a[0].localeCompare(b[0]),
);

let generated = 0;
let pages = 0;
/** @type {string[]} */
const skipped = [];
/** @type {Set<string>} */
const fallback = new Set();

for (const [route, dir] of routes) {
  let any = false;
  for (const { input, output } of LOCALES) {
    const inPath = path.join(dir, input);
    if (!existsSync(inPath)) continue;
    const stdout = execFileSync('node', [TOOL, inPath, path.join(dir, output)], { encoding: 'utf8' });
    for (const m of stdout.matchAll(/No rule for: ([^\n(]+)/g)) {
      for (const tag of m[1].split(',')) fallback.add(tag.trim());
    }
    generated += 1;
    any = true;
  }
  if (any) {
    pages += 1;
    log(route);
  } else {
    skipped.push(route);
  }
}

log(`Generated ${generated} file(s) across ${pages} page(s).`);
if (fallback.size) log(`Components left on fallback: ${[...fallback].sort().join(', ')}`);
if (skipped.length) log(`No MDX (manual pages, skipped): ${skipped.join(', ')}`);
