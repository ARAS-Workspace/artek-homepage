// SPDX-License-Identifier: AGPL-3.0-or-later
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

// React
import React, { lazy, Suspense, useEffect, useState } from 'react';

// Types
import type { TreemapChartOptions } from '@carbon/charts';

// External libraries
import { TreemapChart as CarbonTreemapChart } from '@carbon/charts-react';

// Internal modules
import { useLocale, useIsClient, useCarbonTheme } from '@shared/hooks';
import { translate } from '@shared/translations';

// Local components
import ChartLoader from './ChartLoader';

// Styles
import '@carbon/charts-react/styles.css';
import './styles/TreemapChart.scss';

interface TreemapChartProps {
  // Support both sync data (array) and async data (function returning promise)
  data: any[] | (() => Promise<any[]>);
  options?: Partial<TreemapChartOptions>;
  height?: string;
}

const TreemapChart: React.FC<TreemapChartProps> = ({
  data: dataProp,
  options = {},
  height = '600px',
}) => {
  const isClient = useIsClient();
  const currentTheme = useCarbonTheme();
  const { locale } = useLocale();
  const t = translate(locale);

  // State for chart data and loading
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Handle async data fetching
  useEffect(() => {
    if (typeof dataProp === 'function') {
      // Async data - call the function to get promise
      setIsLoading(true);
      dataProp()
        .then((result) => {
          setChartData(result);
          setIsLoading(false);
        })
        .catch(() => {
          setChartData([]);
          setIsLoading(false);
        });
    } else {
      // Sync data - use directly
      setChartData(dataProp);
      setIsLoading(false);
    }
  }, [dataProp]);

  if (!isClient) {
    return <ChartLoader height={height} />;
  }

  // Loading state
  if (isLoading) {
    return <ChartLoader height={height} />;
  }

  // Show loader if data is empty or invalid (graceful degradation)
  if (!chartData || chartData.length === 0) {
    return <ChartLoader height={height} />;
  }

  const chartOptions: TreemapChartOptions = {
    height: height,
    experimental: true,
    theme: currentTheme,
    locale: {
      code: t.chart.locale.code,
      translations: {
        tabularRep: {
          title: t.chart.locale.tabularRep.title,
          downloadAsCSV: t.chart.locale.tabularRep.downloadAsCSV,
        },
        toolbar: {
          exportAsJPG: t.chart.locale.toolbar.exportAsJPG,
          showAsTable: t.chart.locale.toolbar.showAsTable,
          moreOptions: t.chart.locale.toolbar.moreOptions,
        },
      },
    },
    legend: {
      enabled: true,
      truncation: {
        type: 'end_line',
        numCharacter: 20,
      },
    },
    toolbar: {
      enabled: true,
      controls: [{ type: 'Export as JPG' }, { type: 'Show as data-table' }],
    },
    tooltip: {
      truncation: {
        type: 'end_line',
        numCharacter: 40,
      },
    },
    tabularRepModal: {
      tableHeadingFormatter: (headings) => {
        return headings
          .filter((heading) => heading !== 'Group')
          .map((heading) => {
            if (heading === 'Child') return t.language.key;
            if (heading === 'Value') return t.language.value;
            return heading;
          });
      },
      tableCellFormatter: (cells) => {
        const cellsWithoutGroup = cells.map((row) => [row[0], row[2]]);
        return cellsWithoutGroup.sort((a, b) => {
          const valueA = Number(a[1]);
          const valueB = Number(b[1]);
          return valueB - valueA;
        });
      },
    },
    ...options,
  };

  return <CarbonTreemapChart data={chartData} options={chartOptions} />;
};

// Lazy-loaded version with built-in Suspense boundary and ChartLoader
const LazyTreemapChartComponent = lazy(() => Promise.resolve({ default: TreemapChart }));

const LazyTreemapChart: React.FC<TreemapChartProps> = (props) => (
  <Suspense fallback={<ChartLoader height={props.height || '600px'} />}>
    <LazyTreemapChartComponent {...props} />
  </Suspense>
);

// Composition pattern: Attach Lazy as a property
interface TreemapChartComponent extends React.FC<TreemapChartProps> {
  Lazy: React.FC<TreemapChartProps>;
}

// Use Object.assign to properly extend the component
const TreemapChartWithLazy = Object.assign(TreemapChart, {
  Lazy: LazyTreemapChart,
}) as TreemapChartComponent;

export default TreemapChartWithLazy;
