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
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Absolute path to the tool root (…/tools/agentic-data-builder). */
export const TOOL_ROOT = path.resolve(__dirname, '..');

/** Canonical site base URL — used for the coordinate alternate-locale link. */
export const BASE_URL = 'https://www.artek.tc';

/** Supported locales; the unsuffixed source file is Turkish (site default). */
export const LOCALES = ['en', 'tr'];

/**
 * Locale of a source MDX file by the pages' filename convention:
 * `index.en.mdx` → 'en', unsuffixed `index.mdx` → 'tr'.
 * @param {string} sourcePath
 * @returns {string}
 */
export function localeOf(sourcePath) {
  return path.basename(sourcePath).endsWith('.en.mdx') ? 'en' : 'tr';
}

/**
 * Read the notice template for a locale (`template.<locale>.md`), so each
 * generated file opens in its own language — matching the hand-written
 * llms files. Falls back to the Turkish template (site default) for
 * unrecognized locales, and to an empty string when nothing exists, so
 * `--no-header` and a missing template behave the same.
 *
 * @param {string} [locale]
 * @returns {string}
 */
export function loadTemplate(locale) {
  const candidates = [
    LOCALES.includes(locale) ? path.join(TOOL_ROOT, `template.${locale}.md`) : null,
    path.join(TOOL_ROOT, 'template.tr.md'),
  ].filter(Boolean);
  for (const p of candidates) {
    if (existsSync(p)) return readFileSync(p, 'utf8');
  }
  return '';
}
