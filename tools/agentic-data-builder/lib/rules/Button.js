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
// Rule: <Button …>text</Button> (Carbon) → the button's text. When the button
// itself carries a string link target (`href`, or `to` via as={Link}), a
// markdown link is emitted instead. Buttons nested inside <Link> are already
// consumed by the Link rule; this covers standalone buttons.

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
    typeof props.href === 'string' ? props.href : typeof props.to === 'string' ? props.to : '';
  if (text && target) return `[${text}](${target})`;
  return text || target;
}
