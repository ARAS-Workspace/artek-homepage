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
// Rule: <ArtekBilingualLogo /> → the brand line the logo carries. The bilingual
// ARTEK logo renders the wordmark plus a locale-matched slogan (TR: "Yenilik,
// Strateji, Sonuç." / EN: "Innovation, Strategy, Results."), so the agentic
// text keeps that brand statement instead of dropping the mark silently.

import { localeOf } from '../config.js';

/** @typedef {import('../types.js').RuleProps} RuleProps */

/** Locale → slogan, mirroring the component's slogan-tr / slogan-en groups. */
const SLOGAN = {
  tr: 'Yenilik, Strateji, Sonuç.',
  en: 'Innovation, Strategy, Results.',
};

/**
 * @param {RuleProps} _props
 * @param {object} [_node]
 * @param {{ sourcePath?: string }} [context]
 * @returns {string}
 */
export function rule(_props, _node, context) {
  const locale = context?.sourcePath ? localeOf(context.sourcePath) : 'tr';
  return `**ARTEK** — *${SLOGAN[locale] ?? SLOGAN.tr}*`;
}
