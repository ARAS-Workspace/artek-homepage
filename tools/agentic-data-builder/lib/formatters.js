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
// noinspection JSUnusedGlobalSymbols

import path from 'node:path';
import pc from 'picocolors';

const TAG = pc.cyan('[agentic]');

/** Namespaced console logger — one prefix, colour by severity. */
export const log = {
  /** @param {string} m */
  info: (m) => console.log(`${TAG} ${m}`),
  /** @param {string} m */
  step: (m) => console.log(`${TAG} ${pc.dim(m)}`),
  /** @param {string} m */
  success: (m) => console.log(`${TAG} ${pc.green(m)}`),
  /** @param {string} m */
  warn: (m) => console.log(`${TAG} ${pc.yellow(m)}`),
  /** @param {string} m */
  error: (m) => console.error(`${TAG} ${pc.red(m)}`),
};

/**
 * Shorten an absolute path for display, relative to the current directory.
 * @param {string} p
 * @returns {string}
 */
export function rel(p) {
  const r = path.relative(process.cwd(), p);
  return r === '' ? '.' : r;
}
