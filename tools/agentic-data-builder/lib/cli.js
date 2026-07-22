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
// noinspection JSValidateTypes

import { Command } from 'commander';
import { generate } from './generate.js';

/**
 * Parse argv and run the single-file generator:
 *   agentic-data-builder [options] <input> <output>
 *
 * Batch orchestration lives in the www prerender pipeline, not here.
 *
 * @param {string[]} argv
 * @returns {Promise<void>}
 */
export async function run(argv) {
  const program = new Command();
  program
    .name('agentic-data-builder')
    .description('Generate LLM-friendly markdown from docs MDX sources')
    .version('1.0.0', '-v, --version')
    .argument('<input>', 'Path to the source .mdx file')
    .argument('<output>', 'Path to write the generated .txt/.md file')
    .option('--no-header', 'Do not prepend the bilingual template header')
    .action(
      /**
       * @param {string} input
       * @param {string} output
       * @param {{ header: boolean }} opts
       * @returns {void}
       */
      (input, output, opts) => generate(input, output, opts),
    );

  await program.parseAsync(argv);
}
