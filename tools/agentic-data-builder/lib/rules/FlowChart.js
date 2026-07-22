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
// Rule (data twin): <FlowChart /> → the chart's prose twin inlined verbatim.
// Every page that embeds a FlowChart keeps a hand-written prose description of
// the diagram at data/flow-chart/<locale>/data.prose.md next to the MDX
// (tr for index.mdx, en for index.en.mdx). That file IS the llms
// representation of the chart, so it is inlined as-is; the directive is only
// a fallback for a missing prose file.

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { localeOf } from '../config.js';

/** @typedef {import('../types.js').RuleProps} RuleProps */

const FALLBACK = '> [FlowChart] interactive flow diagram — see the live page.';

/**
 * @param {RuleProps} _props
 * @param {object} _node
 * @param {{ sourceDir?: string|null, sourcePath?: string|null }} [context]
 * @returns {string}
 */
export function rule(_props, _node, context) {
  if (!context?.sourceDir || !context?.sourcePath) return FALLBACK;
  const prose = path.join(
    context.sourceDir,
    'data',
    'flow-chart',
    localeOf(context.sourcePath),
    'data.prose.md',
  );
  if (!existsSync(prose)) return FALLBACK;
  return readFileSync(prose, 'utf8').trim();
}
