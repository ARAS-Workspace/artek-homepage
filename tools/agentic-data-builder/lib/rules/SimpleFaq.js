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
// Rule (import-following): <SimpleFaq content={faqData} /> → the FAQ inlined
// in full. `content` is an imported JSON array of { question, answer } items
// (see src/shared/components/ui/SimpleFaq.tsx); the rule resolves the
// identifier through context.imports relative to the source page and renders
// each item as a "### question" section — the answers are long paragraphs, so
// headings read better than a bold Q one-liner. FAQ text is primary content
// that the fallback directive would otherwise lose.

import { readFileSync } from 'node:fs';
import path from 'node:path';

/** @typedef {import('../types.js').RuleProps} RuleProps */

const FALLBACK = '> [SimpleFaq] FAQ accordion — see the live page.';

/**
 * Resolve a `content={identifier}` expression to the parsed JSON items array.
 * @param {string} expr
 * @param {{ sourceDir?: string|null, imports?: Map<string,string> }} [context]
 * @returns {Array<{question?: string, answer?: string}>|null}
 */
function loadItems(expr, context) {
  const id = String(expr).trim();
  if (!/^[A-Za-z_$][\w$]*$/.test(id)) return null;
  const rel = context?.imports?.get(id);
  if (!rel || !context?.sourceDir) return null;
  try {
    const data = JSON.parse(readFileSync(path.resolve(context.sourceDir, rel), 'utf8'));
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

/**
 * @param {RuleProps} props
 * @param {object} _node
 * @param {{ sourceDir?: string|null, imports?: Map<string,string> }} [context]
 * @returns {string}
 */
export function rule(props, _node, context) {
  const expr = props.content && typeof props.content === 'object' ? props.content.expression : '';
  const items = loadItems(expr, context);
  if (!items || items.length === 0) return FALLBACK;

  const sections = items
    .filter((i) => i && i.question && i.answer)
    .map((i) => `### ${i.question}\n\n${i.answer}`);
  const title = typeof props.title === 'string' ? `## ${props.title}\n\n` : '';
  return title + sections.join('\n\n');
}
