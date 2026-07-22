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

import { rule as Mermaid } from './rules/Mermaid.js';
import { rule as DinoGame } from './rules/DinoGame.js';
import { rule as ContentTabs } from './rules/ContentTabs.js';
import { rule as InlineNotification } from './rules/InlineNotification.js';
import { rule as Link } from './rules/Link.js';
import { rule as Button } from './rules/Button.js';
import { rule as CarbonIcons } from './rules/CarbonIcons.js';
import { rule as ArtekBilingualLogo } from './rules/ArtekBilingualLogo.js';
import { rule as TeamMember } from './rules/TeamMember.js';
import { rule as SimpleFaq } from './rules/SimpleFaq.js';
import { rule as CenterStatistics } from './rules/CenterStatistics.js';
import { rule as Surveys } from './rules/Surveys.js';

/**
 * Component tag → rule. This is the whole extension surface: to teach the
 * builder about a component, add a rule module and one entry here.
 * @type {Record<string, import('./types.js').RuleFn>}
 */
const REGISTRY = {
  Mermaid,
  DinoGame,
  ContentTabs,
  InlineNotification,
  // ARTEK wraps Carbon's InlineNotification; the props contract (kind/title/
  // subtitle) passes straight through, so the same rule serves both tags.
  InlineNotificationWrapper: InlineNotification,
  // Navigation: react-router links and raw anchors share one markdown-link rule.
  Link,
  a: Link,
  Button,
  // @carbon/icons-react tags — one name-dispatched rule (✓/✗ or dropped).
  Checkmark: CarbonIcons,
  Close: CarbonIcons,
  Industry: CarbonIcons,
  Building: CarbonIcons,
  Rocket: CarbonIcons,
  Enterprise: CarbonIcons,
  Chemistry: CarbonIcons,
  Education: CarbonIcons,
  Idea: CarbonIcons,
  ArtekBilingualLogo,
  TeamMember,
  SimpleFaq,
  // Centre-statistics widgets — one name-dispatched directive rule.
  CenterStatistics,
  CentersDataTable: CenterStatistics,
  SectoralDistributionTab1: CenterStatistics,
  SectoralDistributionTab2: CenterStatistics,
  RegionalDistributionTab1: CenterStatistics,
  RegionalDistributionTab2: CenterStatistics,
  // Self-assessment surveys — one name-dispatched directive rule.
  SurveyRD: Surveys,
  SurveyDesign: Surveys,
};

/**
 * Look up the rule for a JSX tag, or `null` when none is registered.
 * @param {string} tag
 * @returns {import('./types.js').RuleFn | null}
 */
export function getRule(tag) {
  // Member tags (e.g. `DinoGame.Lazy`) fall back to their base component's rule.
  return REGISTRY[tag] ?? REGISTRY[tag.split('.')[0]] ?? null;
}

/**
 * The set of component tags that currently have a rule.
 * @returns {string[]}
 */
export function knownTags() {
  return Object.keys(REGISTRY);
}
