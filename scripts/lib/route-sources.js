// noinspection JSUnusedGlobalSymbols
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
 */

import { readFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';

// Handle ESM/CJS interop for @babel/traverse (same as build_routes.js).
const traverse = _traverse.default || _traverse;

/**
 * Parse src/router/index.tsx and build a route → absolute page-directory map.
 *
 * The router is the single authority for route ↔ page directory. Only lazy
 * page components are mapped; layout wrappers (MainLayout / ConsultancyLayout)
 * are skipped.
 *
 * Import → directory resolution (ARTEK conventions, diverging from the
 * phantom-www reference which always strips the last segment):
 *   - `@pages/home`            → src/pages/home            (bare directory import)
 *   - `@pages/company/_base`   → src/pages/company         (`_base` holds the
 *     component; page data/MDX live in the parent directory)
 *   - `@shared/pages/x/CompFile` → src/shared/pages/x      (component-file leaf)
 * Rule: a `_base` leaf maps to its parent; an existing directory maps to
 * itself; anything else (a component file) maps to its parent.
 *
 * @param {string} routerPath  Absolute path to src/router/index.tsx.
 * @param {string} srcRoot     Absolute path to src/ — `@pages` resolves to
 *   `<srcRoot>/pages`, `@shared` to `<srcRoot>/shared`.
 * @returns {Map<string, string>}  route → page directory
 */
export function buildRouteMap(routerPath, srcRoot) {
  const ast = parse(readFileSync(routerPath, 'utf8'), {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });

  const ALIASES = [
    { prefix: '@pages/', root: path.join(srcRoot, 'pages') },
    { prefix: '@shared/', root: path.join(srcRoot, 'shared') },
  ];

  /** @param {string} lit  Lazy-import string literal. @returns {string|null} */
  const resolveDir = (lit) => {
    const alias = ALIASES.find((a) => lit.startsWith(a.prefix));
    if (!alias) return null;
    const abs = path.join(alias.root, lit.slice(alias.prefix.length));
    if (path.basename(abs) === '_base') return path.dirname(abs);
    if (existsSync(abs) && statSync(abs).isDirectory()) return abs;
    return path.dirname(abs);
  };

  // ── Pass 1: component name → source directory ─────────────────────
  /** @type {Map<string, string>} */
  const componentDir = new Map();
  traverse(ast, {
    VariableDeclarator(p) {
      const name = p.node.id?.name;
      const init = p.node.init;
      if (!name || init?.type !== 'CallExpression' || init.callee?.name !== 'lazy') return;
      const body = init.arguments[0]?.body; // () => import('…')
      if (body?.type !== 'CallExpression' || body.callee?.type !== 'Import') return;
      const lit = body.arguments[0];
      if (lit?.type !== 'StringLiteral') return;
      const dir = resolveDir(lit.value);
      if (dir) componentDir.set(name, dir);
    },
  });

  // ── Pass 2: walk the route tree, accumulate paths, map route → dir ─
  /** @type {Map<string, string>} */
  const routeDir = new Map();

  const joinPath = (parent, child) => {
    if (!child) return parent;
    if (child.startsWith('/')) return child;
    return parent === '/' ? `/${child}` : `${parent}/${child}`;
  };

  /** @param {any} objNode @param {string} parentPath */
  const walk = (objNode, parentPath) => {
    let curPath = parentPath;
    let isIndex = false;
    let elementName;
    let children;
    for (const prop of objNode.properties) {
      if (prop.type !== 'ObjectProperty') continue;
      const key = prop.key.name ?? prop.key.value;
      if (key === 'path' && prop.value.type === 'StringLiteral') {
        curPath = joinPath(parentPath, prop.value.value);
      } else if (key === 'index' && prop.value.type === 'BooleanLiteral') {
        isIndex = prop.value.value;
      } else if (key === 'element' && prop.value.type === 'JSXElement') {
        elementName = prop.value.openingElement?.name?.name;
      } else if (key === 'children' && prop.value.type === 'ArrayExpression') {
        children = prop.value.elements;
      }
    }

    const raw = (isIndex ? parentPath : curPath) || '/';
    // strip dynamic segments (e.g. /:locale) — parity with the prerender route list
    const route = raw.includes(':') ? raw.replace(/\/:[^/]+/g, '') || '/' : raw;
    if (elementName && componentDir.has(elementName)) {
      routeDir.set(route, componentDir.get(elementName));
    }
    if (children) {
      for (const c of children) if (c?.type === 'ObjectExpression') walk(c, curPath);
    }
  };

  traverse(ast, {
    CallExpression(p) {
      if (p.node.callee?.name !== 'createBrowserRouter') return;
      const arr = p.node.arguments[0];
      if (arr?.type !== 'ArrayExpression') return;
      for (const el of arr.elements) if (el?.type === 'ObjectExpression') walk(el, '');
    },
  });

  return routeDir;
}
