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
// Central JSDoc typedefs for agentic-data-builder. No runtime code lives here.
// Reference via `@typedef {import('../types.js').Name} Name` in consuming files.

/**
 * A prop value extracted from an MDX JSX attribute.
 * - `string`          → literal attribute (`prop="x"`)
 * - `true`            → boolean attribute (`prop`)
 * - `{ expression }`  → JS expression attribute (`prop={…}`), raw source text
 *
 * @typedef {string | true | { expression: string }} RulePropValue
 */

/**
 * The props object handed to a component rule: attribute name → value.
 * @typedef {Record<string, RulePropValue>} RuleProps
 */

/**
 * A component rule: turns a component's props into agentic Markdown text.
 * `node` is the raw mdast JSX node; `context` carries the transform's
 * imports / exports / resolve for data rules (import-following, exported
 * literals). Both are optional.
 * @typedef {(props: RuleProps, node?: object, context?: object) => string} RuleFn
 */
