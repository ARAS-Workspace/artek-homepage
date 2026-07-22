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
 * Route Builder — writes routes.yaml for the prerender pipeline.
 *
 * The router is parsed once, by lib/route-sources.js (the single source of
 * truth for route ↔ page directory). This script takes the route list from
 * that map, orders it, and writes routes.yaml.
 *
 * Usage:
 *     node scripts/build_routes.js
 */

import { writeFileSync } from 'fs';
import yaml from 'js-yaml';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { buildRouteMap } from './lib/route-sources.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const ROUTER_PATH = join(PROJECT_ROOT, 'src/router/index.tsx');
const SRC_ROOT = join(PROJECT_ROOT, 'src');
const ROUTES_CONFIG_PATH = join(PROJECT_ROOT, 'routes.yaml');

const log = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  success: (msg) => console.log(`[SUCCESS] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
};

/**
 * Order routes by depth then name — the routes.yaml ordering.
 * @param {Iterable<string>} routes
 * @returns {string[]}
 */
function sortRoutes(routes) {
  return [...routes].sort((a, b) => {
    const depthA = (a.match(/\//g) || []).length;
    const depthB = (b.match(/\//g) || []).length;
    if (depthA !== depthB) return depthA - depthB;
    return a.localeCompare(b);
  });
}

function main() {
  log.info('Route Builder - Starting');

  try {
    log.info(`Reading router from ${ROUTER_PATH}`);
    const routes = sortRoutes(buildRouteMap(ROUTER_PATH, SRC_ROOT).keys());

    if (routes.length === 0) {
      log.error('No routes found!');
      return false;
    }

    log.info(`Found ${routes.length} routes:`);
    routes.forEach((route) => log.info(`  - ${route}`));

    const newYaml = yaml.dump({ routes }, { indent: 2, lineWidth: -1, sortKeys: false });
    writeFileSync(ROUTES_CONFIG_PATH, newYaml, 'utf-8');
    log.success(`Updated ${ROUTES_CONFIG_PATH} with ${routes.length} routes`);
    return true;
  } catch (error) {
    log.error(`Fatal error: ${error.message}`);
    return false;
  }
}

process.exit(main() ? 0 : 1);
