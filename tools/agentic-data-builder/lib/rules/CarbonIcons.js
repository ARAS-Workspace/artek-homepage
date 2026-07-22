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
// Rule: @carbon/icons-react tags → their text equivalent. Checkmark and Close
// are semantic yes/no marks (the "what we do / don't do" comparison sections),
// so they become ✓ / ✗. Every other icon in the corpus (Industry, Building,
// Rocket, …) is decorative and drops to an empty string — the transform then
// removes the node entirely. One module serves all icon tags; the registry
// maps each tag name here and the rule dispatches on `node.name`.

/** @typedef {import('../types.js').RuleProps} RuleProps */

/** Icon tag → text stand-in. Tags absent from the map are decorative. */
const ICON_TEXT = {
  Checkmark: '✓',
  Close: '✗',
};

/**
 * @param {RuleProps} _props
 * @param {object} [node]
 * @returns {string}
 */
export function rule(_props, node) {
  return ICON_TEXT[node?.name] ?? '';
}
