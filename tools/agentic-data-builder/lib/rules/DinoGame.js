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
// Rule (descriptive): <DinoGame /> → a hand-authored description. The component
// is a playable mini-game (Chrome-dino style) with no textual content to
// extract, so the rule simply explains what occupies this area — in the
// output file's own language.

import { localeOf } from '../config.js';

/** @typedef {import('../types.js').RuleProps} RuleProps */

/** Locale → directive text. */
const TEXT = {
  tr: '> [İnteraktif] Oynanabilir bir mini oyun (Chrome-dino tarzı). Metinsel karşılığı olmayan görsel/interaktif içerik.',
  en: '> [Interactive] A playable mini-game (Chrome-dino style). Visual/interactive content with no textual equivalent.',
};

/**
 * @param {RuleProps} _props
 * @param {object} [_node]
 * @param {{ sourcePath?: string|null }} [context]
 * @returns {string}
 */
export function rule(_props, _node, context) {
  const locale = context?.sourcePath ? localeOf(context.sourcePath) : 'tr';
  return TEXT[locale] ?? TEXT.tr;
}
