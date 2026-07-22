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
// Rule: <TeamMember name title image links /> → one compact markdown list
// item: bolded name, an em dash, the role title, then the social links inline.
// Props contract from src/shared/components/ui/TeamMember.tsx (name, title,
// image, links: [{ text, url }]); the portrait image is decorative and dropped.

/** @typedef {import('../types.js').RuleProps} RuleProps */

/** Match `{ text: '…', url: '…' }` entries in the links array expression. */
const LINK_RE = /{\s*text:\s*['"]([^'"]+)['"]\s*,\s*url:\s*['"]([^'"]+)['"]\s*,?\s*}/g;

/**
 * @param {RuleProps} props
 * @returns {string}
 */
export function rule(props) {
  const name = typeof props.name === 'string' ? props.name : '';
  const title = typeof props.title === 'string' ? props.title : '';
  const raw = props.links && typeof props.links === 'object' ? props.links.expression : '';
  const links = [...String(raw).matchAll(LINK_RE)].map((m) => `[${m[1]}](${m[2]})`);

  const head = [name && `**${name}**`, title].filter(Boolean).join(' — ');
  return links.length ? `- ${head} · ${links.join(' · ')}` : `- ${head}`;
}
