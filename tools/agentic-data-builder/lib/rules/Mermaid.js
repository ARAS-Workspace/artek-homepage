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
// Rule (mechanical): <Mermaid chart={`…`} /> → a fenced ```mermaid block.
//
// The `chart` prop is a static template literal across the docs (no `${}`
// interpolation), so we unwrap it to its cooked source without evaluating it.

/** @typedef {import('../types.js').RuleProps} RuleProps */

/**
 * Strip the surrounding backticks of a template-literal expression and resolve
 * its escape sequences to the cooked string value. Assumes no `${}` interpolation.
 *
 * @param {string} raw
 * @returns {string}
 */
function unwrapTemplateLiteral(raw) {
  let s = raw.trim();
  if (s.startsWith('`') && s.endsWith('`')) s = s.slice(1, -1);
  return s.replace(/\\([\s\S])/g, (_, ch) => {
    switch (ch) {
      case 'n':
        return '\n';
      case 't':
        return '\t';
      case 'r':
        return '\r';
      case '`':
        return '`';
      case '$':
        return '$';
      case '\\':
        return '\\';
      default:
        return ch;
    }
  });
}

/**
 * @param {RuleProps} props
 * @returns {string}
 */
export function rule(props) {
  const chart = props.chart;
  const raw = chart && typeof chart === 'object' ? chart.expression : String(chart ?? '');
  const source = unwrapTemplateLiteral(raw).trim();
  return '```mermaid\n' + source + '\n```';
}
