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
// Rule: <InlineNotification kind title subtitle /> → a GitHub-style alert
// carrying the notification's text. `title` + `subtitle` are primary content
// (notes, warnings, callouts) that the fallback directive would otherwise lose —
// this component is used ~30× across the docs.

/** @typedef {import('../types.js').RuleProps} RuleProps */

/** Carbon `kind` → GitHub alert type. */
const ALERT = {
  info: 'NOTE',
  'info-square': 'NOTE',
  success: 'TIP',
  warning: 'WARNING',
  'warning-alt': 'WARNING',
  error: 'CAUTION',
};

/**
 * Collapse the newlines + indentation that multi-line MDX attribute strings
 * carry, so every alert line stays inside the `>` blockquote.
 * @param {unknown} v
 * @returns {string}
 */
const oneLine = (v) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : '');

/**
 * @param {RuleProps} props
 * @returns {string}
 */
export function rule(props) {
  const kind = typeof props.kind === 'string' ? props.kind : 'info';
  const title = oneLine(props.title);
  const subtitle = oneLine(props.subtitle);

  const lines = [`> [!${ALERT[kind] ?? 'NOTE'}]`];
  if (title) lines.push(`> **${title}**`);
  if (subtitle) lines.push(`> ${subtitle}`);
  return lines.join('\n');
}
