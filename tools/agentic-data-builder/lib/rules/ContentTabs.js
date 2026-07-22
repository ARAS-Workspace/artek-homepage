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
// Rule (import-following): <ContentTabs tabs={[{ label, content: <Imported> }]} />
// → each tab's imported MDX content, transformed and separated. The `content`
// values are imported component identifiers; the rule follows them through the
// transform context (context.resolve), which reads + transforms the imported
// MDX file relative to the source page. Tabs whose content is a plain React
// component (not MDX) fall through to context.dispatch, which renders the
// identifier via its registered rule (e.g. the survey and statistics
// directives) instead of losing the tab.

/** @typedef {import('../types.js').RuleProps} RuleProps */

/** Match `{ label: '…', content: Identifier }` entries in the tabs array. */
const TAB_RE = /{\s*label:\s*['"]([^'"]+)['"]\s*,\s*content:\s*([A-Za-z_$][\w$]*)\s*,?\s*}/g;

/**
 * @param {RuleProps} props
 * @param {object} _node
 * @param {{ resolve?: (id: string) => string | null, dispatch?: (id: string) => string | null }} [context]
 * @returns {string}
 */
export function rule(props, _node, context) {
  const expr = props.tabs && typeof props.tabs === 'object' ? props.tabs.expression : '';
  const tabs = [...String(expr).matchAll(TAB_RE)].map((m) => ({ label: m[1], content: m[2] }));
  if (tabs.length === 0) {
    return '> [ContentTabs] tabbed content — see the live page.';
  }

  const sections = tabs.map(({ label, content }) => {
    const md = context?.resolve?.(content) ?? context?.dispatch?.(content) ?? null;
    return `**Tab: ${label}**\n\n${md || '_(tab content unavailable)_'}`;
  });
  return sections.join('\n\n---\n\n');
}
