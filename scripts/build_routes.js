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
 * Usage:
 *     node scripts/build_routes.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import yaml from 'js-yaml';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
// Handle ESM/CJS compatibility for @babel/traverse
// noinspection JSUnresolvedVariable
const traverse = _traverse.default || _traverse;

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');
const ROUTER_PATH = join(PROJECT_ROOT, 'src/router/index.tsx');
const ROUTES_CONFIG_PATH = join(PROJECT_ROOT, 'routes.yaml');

// Logging utilities
const log = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  success: (msg) => console.log(`[SUCCESS] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
  warning: (msg) => console.log(`[WARNING] ${msg}`),
};

/**
 * Extract routes from router configuration
 * @param {string} routerCode - TypeScript router code
 * @returns {string[]} Array of route paths
 */
function extractRoutes(routerCode) {
  const routes = new Set();

  try {
    // Parse TypeScript code to AST
    const ast = parse(routerCode, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    });

    // Find createBrowserRouter call
    // noinspection JSUnusedGlobalSymbols
    traverse(ast, {
      // Babel traverse visitor pattern - CallExpression is the visitor name
      CallExpression(path) {
        // Look for createBrowserRouter([...])
        if (
          path.node.callee.type === 'Identifier' &&
          path.node.callee.name === 'createBrowserRouter' &&
          path.node.arguments.length > 0 &&
          path.node.arguments[0].type === 'ArrayExpression'
        ) {
          const routeArray = path.node.arguments[0].elements;

          // Process each route object
          routeArray.forEach((routeNode) => {
            if (routeNode && routeNode.type === 'ObjectExpression') {
              processRouteObject(routeNode, '', routes);
            }
          });
        }
      },
    });

    // Convert Set to sorted array and return
    return Array.from(routes).sort((a, b) => {
      // Sort by depth first (/ before /contact before /centers-statistics/rd)
      const depthA = (a.match(/\//g) || []).length;
      const depthB = (b.match(/\//g) || []).length;
      if (depthA !== depthB) return depthA - depthB;
      return a.localeCompare(b);
    });
  } catch (error) {
    log.error(`Failed to parse router: ${error.message}`);
    throw error;
  }
}

/**
 * Process a route object and its children recursively
 * @param {Object} routeNode - AST node for route object
 * @param {string} parentPath - Parent route path
 * @param {Set<string>} routes - Set to collect routes
 */
function processRouteObject(routeNode, parentPath, routes) {
  let currentPath = parentPath;
  let hasIndex = false;
  let children = null;

  // Extract properties from route object
  routeNode.properties.forEach((prop) => {
    if (prop.type !== 'ObjectProperty') return;

    const key = prop.key.name || prop.key.value;

    if (key === 'path' && prop.value.type === 'StringLiteral') {
      const pathValue = prop.value.value;

      // Build full path
      if (pathValue.startsWith('/')) {
        currentPath = pathValue;
      } else if (parentPath) {
        currentPath = parentPath === '/' ? `/${pathValue}` : `${parentPath}/${pathValue}`;
      } else {
        currentPath = `/${pathValue}`;
      }
    }

    if (key === 'index' && prop.value.type === 'BooleanLiteral' && prop.value.value === true) {
      hasIndex = true;
    }

    if (key === 'children' && prop.value.type === 'ArrayExpression') {
      children = prop.value.elements;
    }
  });

  // Dynamic segments (e.g. /:locale) — strip and treat children as if mounted under the parent
  if (currentPath.includes(':')) {
    currentPath = currentPath.replace(/\/:[^/]+/g, '') || '/';
  } else if (currentPath) {
    routes.add(currentPath);
  }

  // If route has index: true, add parent path
  if (hasIndex && parentPath && !routes.has(parentPath)) {
    routes.add(parentPath);
  }

  // Process children recursively
  if (children) {
    children.forEach((childNode) => {
      if (childNode && childNode.type === 'ObjectExpression') {
        processRouteObject(childNode, currentPath, routes);
      }
    });
  }
}

/**
 * Update routes.yaml with new routes
 * @param {string[]} routes - Array of route paths
 */
function updateYamlConfig(routes) {
  try {
    // Create routes config object
    const config = {
      routes: routes,
    };

    // Write to YAML
    const newYaml = yaml.dump(config, {
      indent: 2,
      lineWidth: -1, // Don't wrap lines
      sortKeys: false, // Preserve key order
    });

    writeFileSync(ROUTES_CONFIG_PATH, newYaml, 'utf-8');
    log.success(`Updated ${ROUTES_CONFIG_PATH} with ${routes.length} routes`);
  } catch (error) {
    log.error(`Failed to update YAML: ${error.message}`);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  log.info('Route Builder - Starting');

  try {
    // Read router file
    log.info(`Reading router from ${ROUTER_PATH}`);
    const routerCode = readFileSync(ROUTER_PATH, 'utf-8');

    // Extract routes
    log.info('Extracting routes from AST...');
    const routes = extractRoutes(routerCode);

    if (routes.length === 0) {
      log.warning('No routes found!');
      return false;
    }

    log.info(`Found ${routes.length} routes:`);
    routes.forEach((route) => log.info(`  - ${route}`));

    // Update YAML config
    log.info('Updating routes.yaml...');
    updateYamlConfig(routes);

    log.success('Route extraction complete!');
    return true;
  } catch (error) {
    log.error(`Fatal error: ${error.message}`);
    return false;
  }
}

// Run
main()
  .then((success) => process.exit(success ? 0 : 1))
  .catch((error) => {
    log.error(`Unhandled error: ${error}`);
    process.exit(1);
  });
