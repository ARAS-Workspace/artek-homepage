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
// Rule (directive): <SurveyRD /> / <SurveyDesign /> → a one-line note that a
// self-assessment survey lives on the live page. The surveys are interactive
// question flows (6 questions from the Ministry of Industry and Technology
// eligibility criteria) with no static textual equivalent. One module serves
// both tags; the rule dispatches on `node.name`.

/** @typedef {import('../types.js').RuleProps} RuleProps */

import { localeOf } from '../config.js';

/** Survey tag → what the survey assesses, per locale. */
const SUBJECT = {
  SurveyRD: { tr: 'Ar-Ge Merkezi', en: 'R&D Centre' },
  SurveyDesign: { tr: 'Tasarım Merkezi', en: 'Design Centre' },
};

/**
 * @param {RuleProps} _props
 * @param {object} [node]
 * @param {{ sourcePath?: string|null }} [context]
 * @returns {string}
 */
export function rule(_props, node, context) {
  const locale = context?.sourcePath ? localeOf(context.sourcePath) : 'tr';
  const subject = SUBJECT[node?.name]?.[locale] ?? (locale === 'tr' ? 'merkez' : 'centre');
  if (locale === 'tr') {
    return `> [${node?.name}] 6 soruluk ${subject} uygunluk öz-değerlendirme anketi (Sanayi ve Teknoloji Bakanlığı kriterleri) — canlı sayfada doldurulabilir.`;
  }
  return `> [${node?.name}] A 6-question ${subject} eligibility self-assessment survey (Ministry of Industry and Technology criteria) — take it on the live page.`;
}
