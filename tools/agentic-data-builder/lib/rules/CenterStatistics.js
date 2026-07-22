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
// Rule (directive + data pointer): the centre-statistics widgets —
// <CenterStatistics/>, <CentersDataTable/> and the Sectoral/Regional
// distribution tabs — are chart/table components fed from public JSON
// endpoints (see src/pages/services/consultancy/centers/statistics/_shared/
// utils/statisticsDataFetcher.ts). Their content is fetched at runtime and
// cannot be inlined deterministically, so each tag emits a directive that
// names the widget and points at its raw data URL. One module serves all six
// tags; the registry maps each tag name here and the rule dispatches on
// `node.name`. The centre type is inferred from the page's own directory
// (…/rd-centers/… vs …/design-centers/…).

import path from 'node:path';
import { BASE_URL, localeOf } from '../config.js';

/** @typedef {import('../types.js').RuleProps} RuleProps */

/**
 * Infer the data-endpoint centre type from the source page's directory, with
 * the component's own `centerType` prop ("rd" | "design") as fallback.
 * @param {{ sourcePath?: string|null }} [context]
 * @param {RuleProps} [props]
 * @returns {'rd-centers'|'design-centers'}
 */
function centerTypeOf(context, props = {}) {
  const dir = context?.sourcePath ? path.basename(path.dirname(context.sourcePath)) : '';
  if (dir === 'design-centers' || dir === 'rd-centers') return dir;
  return props.centerType === 'design' ? 'design-centers' : 'rd-centers';
}

/**
 * @param {RuleProps} props
 * @param {object} [node]
 * @param {{ sourcePath?: string|null }} [context]
 * @returns {string}
 */
export function rule(props, node, context) {
  const type = centerTypeOf(context, props);
  const base = `${BASE_URL}/data/center-statistics/${type}`;
  const locale = context?.sourcePath ? localeOf(context.sourcePath) : 'tr';

  if (locale === 'tr') {
    switch (node?.name) {
      case 'CenterStatistics':
        return `> [CenterStatistics] Başlıca göstergelerin interaktif panosu (toplam merkez ve personel, eğitim seviyeleri, tamamlanan/devam eden projeler, patentler, yabancı ortaklıklar). Ham veri: ${base}/center_statistics.json`;
      case 'CentersDataTable':
        return `> [CentersDataTable] Tüm merkezleri listeleyen aranabilir interaktif tablo (ad, şehir, sektör). Ham veri: ${base}/centers.json`;
      case 'SectoralDistributionTab1':
        return `> [SectoralDistribution] Merkezlerin sektörel dağılımının interaktif treemap grafiği. Ham veri: ${base}/sectoral_distribution_data.${locale}.json`;
      case 'SectoralDistributionTab2':
        return `> [SectoralDistribution] Merkezlerin sektörel dağılımının interaktif tablosu. Ham veri: ${base}/sectoral_distribution_data.${locale}.json`;
      case 'RegionalDistributionTab1':
        return `> [RegionalDistribution] Merkezlerin illere göre dağılımının interaktif koroplet haritası. Ham veri: ${base}/regional_distribution_raw_data.json`;
      case 'RegionalDistributionTab2':
        return `> [RegionalDistribution] Merkezlerin illere göre dağılımının interaktif tablosu. Ham veri: ${base}/regional_distribution_raw_data.json`;
      default:
        return `> [${node?.name}] interaktif istatistik bileşeni — canlı sayfaya bakın.`;
    }
  }

  switch (node?.name) {
    case 'CenterStatistics':
      return `> [CenterStatistics] Interactive dashboard of headline figures (total centres and personnel, education levels, completed/ongoing projects, patents, foreign partnerships). Raw data: ${base}/center_statistics.json`;
    case 'CentersDataTable':
      return `> [CentersDataTable] Interactive searchable table listing every centre (name, city, sector). Raw data: ${base}/centers.json. English sector names: ${base}/sector_names_map.json.`;
    case 'SectoralDistributionTab1':
      return `> [SectoralDistribution] Interactive treemap chart of the centres' sectoral distribution. Raw data: ${base}/sectoral_distribution_data.${locale}.json`;
    case 'SectoralDistributionTab2':
      return `> [SectoralDistribution] Interactive table of the centres' sectoral distribution. Raw data: ${base}/sectoral_distribution_data.${locale}.json`;
    case 'RegionalDistributionTab1':
      return `> [RegionalDistribution] Interactive choropleth map of the centres' distribution by province. Raw data: ${base}/regional_distribution_raw_data.json`;
    case 'RegionalDistributionTab2':
      return `> [RegionalDistribution] Interactive table of the centres' distribution by province. Raw data: ${base}/regional_distribution_raw_data.json`;
    default:
      return `> [${node?.name}] interactive statistics component — see the live page.`;
  }
}
