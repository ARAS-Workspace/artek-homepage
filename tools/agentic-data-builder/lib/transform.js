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
// noinspection JSUnresolvedReference

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkStringify from 'remark-stringify';
import { visit, SKIP } from 'unist-util-visit';
import { getRule } from './registry.js';

/** MDX plumbing nodes dropped from the output (mdxjsEsm handled separately). */
const DROP_TYPES = new Set([
  'mdxFlowExpression', // {/* block comment */} / {expression}
  'mdxTextExpression', // inline {expression}
  'yaml', // frontmatter
]);

/** JSX component nodes that are dispatched to a rule. */
const JSX_TYPES = new Set(['mdxJsxFlowElement', 'mdxJsxTextElement']);

/**
 * Lowercase HTML container tags that carry layout only: instead of dispatching
 * to a rule (which would swallow their children), the transform splices their
 * children into the parent and keeps visiting them.
 */
const UNWRAP_TAGS = new Set(['div', 'span', 'section']);

/** Default import statements: `import Name from './path'`. */
const IMPORT_RE = /import\s+([A-Za-z_$][\w$]*)\s+from\s+['"]([^'"]+)['"]/g;

/** How deep import-following may recurse (circular-import backstop). */
const MAX_DEPTH = 6;

/**
 * @typedef {object} RuleContext
 * @property {string|null} sourceDir             Source MDX directory (for relative imports).
 * @property {string|null} sourcePath            Absolute path of the source MDX file.
 * @property {Map<string,string>} imports        Imported identifier → import path.
 * @property {Map<string,unknown>} exports        `export const` name → literal value.
 * @property {(id: string) => string|null} resolve  Imported identifier → transformed Markdown, or null.
 * @property {(id: string) => string|null} dispatch  Identifier → its registered rule's Markdown, or null.
 */

/**
 * Evaluate an ESTree node that is a pure data literal (string/number/boolean,
 * array, object, template literal). Anything computed returns undefined.
 * @param {any} node
 * @returns {unknown}
 */
function estreeToValue(node) {
  switch (node?.type) {
    case 'Literal':
      return node.value;
    case 'ArrayExpression':
      return node.elements.map((el) => (el ? estreeToValue(el) : null));
    case 'ObjectExpression': {
      /** @type {Record<string, unknown>} */
      const obj = {};
      for (const p of node.properties) {
        if (p.type !== 'Property') continue;
        const key = p.key.type === 'Identifier' ? p.key.name : p.key.value;
        obj[key] = estreeToValue(p.value);
      }
      return obj;
    }
    case 'TemplateLiteral':
      return node.quasis.map((q) => q.value.cooked).join('');
    default:
      return undefined;
  }
}

/**
 * Collect `export const <name> = <literal>` values from an mdxjsEsm node's
 * ESTree into the exports map (attached by remark-mdx).
 * @param {any} node
 * @param {Map<string,unknown>} exports
 */
function collectExports(node, exports) {
  const body = node.data?.estree?.body;
  if (!Array.isArray(body)) return;
  for (const stmt of body) {
    if (stmt.type !== 'ExportNamedDeclaration' || stmt.declaration?.type !== 'VariableDeclaration') continue;
    for (const decl of stmt.declaration.declarations) {
      if (decl.id?.type === 'Identifier' && decl.init) {
        exports.set(decl.id.name, estreeToValue(decl.init));
      }
    }
  }
}

/**
 * Flatten an mdast JSX node's attributes into a plain props object.
 * @param {Array<object>} [attributes]
 * @returns {import('./types.js').RuleProps}
 */
function attributesToProps(attributes = []) {
  /** @type {import('./types.js').RuleProps} */
  const props = {};
  for (const attr of attributes) {
    if (attr.type !== 'mdxJsxAttribute') continue; // skip {...spread}
    if (attr.value == null) props[attr.name] = true;
    else if (typeof attr.value === 'string') props[attr.name] = attr.value;
    else if (attr.value.type === 'mdxJsxAttributeValueExpression')
      props[attr.name] = { expression: attr.value.value };
  }
  return props;
}

/**
 * Turn one JSX node into Markdown via its rule, or a visible fallback directive.
 * @param {object} node
 * @param {RuleContext} context
 * @param {(tag: string) => void} [onUnknown]
 * @returns {string}
 */
function renderComponent(node, context, onUnknown) {
  const rule = getRule(node.name);
  const props = attributesToProps(node.attributes);
  if (rule) return rule(props, node, context);
  if (onUnknown) onUnknown(node.name);
  return `> [${node.name}] interactive component — see the live page.`;
}

/**
 * unified transformer: collect `export const` data, drop MDX plumbing, and swap
 * each JSX component for its rule's Markdown. Rules get a context that can
 * resolve imported components (import-following) and read exported literals.
 *
 * @param {{ onUnknown?: (tag: string) => void, sourcePath?: string, imports?: Map<string,string>, depth?: number }} [options]
 */
function agenticRules(options = {}) {
  const sourceDir = options.sourcePath ? path.dirname(path.resolve(options.sourcePath)) : null;
  const imports = options.imports ?? new Map();
  /** @type {Map<string, unknown>} */
  const exportsMap = new Map();
  const depth = options.depth ?? 0;

  /** @type {RuleContext} */
  const context = {
    sourceDir,
    sourcePath: options.sourcePath ? path.resolve(options.sourcePath) : null,
    imports,
    exports: exportsMap,
    resolve(id) {
      const rel = imports.get(id);
      if (!rel || !sourceDir || depth >= MAX_DEPTH) return null;
      const abs = path.resolve(sourceDir, rel);
      if (!existsSync(abs)) return null;
      return transformMdx(readFileSync(abs, 'utf8'), {
        onUnknown: options.onUnknown,
        sourcePath: abs,
        depth: depth + 1,
      }).trim();
    },
    // Render an identifier through its registered rule, as if it were a bare
    // <Identifier /> tag. Lets container rules (ContentTabs) hand non-MDX tab
    // content — plain React components — to the registry instead of losing it.
    dispatch(id) {
      const rule = getRule(id);
      if (!rule) return null;
      return rule({}, { type: 'mdxJsxFlowElement', name: id, attributes: [], children: [] }, context);
    },
  };

  return (/** @type {object} */ tree) => {
    visit(tree, (node, index, parent) => {
      if (!parent || index == null) return undefined;

      if (node.type === 'mdxjsEsm') {
        collectExports(node, exportsMap); // capture `export const …` before dropping
        parent.children.splice(index, 1);
        return index;
      }
      if (DROP_TYPES.has(node.type)) {
        parent.children.splice(index, 1);
        return index;
      }
      if (JSX_TYPES.has(node.type)) {
        // HTML containers are layout, not content: unwrap and keep visiting.
        if (typeof node.name === 'string' && UNWRAP_TAGS.has(node.name)) {
          parent.children.splice(index, 1, ...node.children);
          return index; // revisit from the first spliced child
        }
        const value = renderComponent(node, context, options.onUnknown);
        if (value === '') {
          parent.children.splice(index, 1); // decorative — leave no residue
          // Removing an inline node strands the space that followed it (it
          // would stringify as a hard `&#x20;` at a heading start) — trim it.
          const next = parent.children[index];
          if (node.type === 'mdxJsxTextElement' && next?.type === 'text') {
            next.value = String(next.value).replace(/^[ \t]+/, '');
          }
          return index;
        }
        parent.children[index] = { type: 'html', value };
        return SKIP; // replacement is verbatim; do not descend
      }
      return undefined;
    });
  };
}

/**
 * Transform MDX source into agentic Markdown text.
 *
 * @param {string} source
 * @param {{ onUnknown?: (tag: string) => void, sourcePath?: string, depth?: number }} [options]
 * @returns {string}
 */
export function transformMdx(source, options = {}) {
  // Pre-collect imports from the raw source (position-independent) for import-following.
  const imports = new Map();
  for (const m of source.matchAll(IMPORT_RE)) imports.set(m[1], m[2]);

  // noinspection JSValidateTypes
  const file = unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ['yaml'])
    .use(remarkGfm)
    .use(remarkMdx)
    .use(agenticRules, { ...options, imports })
    .use(remarkStringify, {
      bullet: '-',
      fences: true,
      rule: '-',
      emphasis: '_',
      strong: '*',
    })
    .processSync(source);

  return String(file).trimEnd() + '\n';
}
