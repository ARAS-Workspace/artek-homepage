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
// Rule: <Link to="/x">…</Link> (react-router) and raw <a href="…">…</a> →
// a plain markdown link `[text](target)`. The link text is the recursive
// plain-text content of the node (buttons and other JSX wrappers included).
// When the target is an expression (not a string), the text alone is emitted.

import { textContent } from '../mdast-text.js';

/** @typedef {import('../types.js').RuleProps} RuleProps */

/**
 * @param {RuleProps} props
 * @param {object} [node]
 * @returns {string}
 */
export function rule(props, node) {
  const text = textContent(node);
  const target =
    typeof props.to === 'string' ? props.to : typeof props.href === 'string' ? props.href : '';
  if (!target) return text;
  if (!text) return `<${target}>`;
  return `[${text}](${target})`;
}
