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
import React, { lazy, Suspense, useState, useEffect } from 'react';

// Types
import type { ChoroplethChartOptions } from '@carbon/charts';
import type { Topology } from 'topojson-specification';

// External libraries
import { ChoroplethChart as CarbonChoroplethChart } from '@carbon/charts-react';

// Internal modules
import { useLocale, useIsClient, useCarbonTheme } from '@shared/hooks';
import { translate } from '@shared/translations';

// Local components
import ChartLoader from './ChartLoader';

// Styles
import '@carbon/charts-react/styles.css';
import './styles/ChoroplethChart.scss';

interface ChoroplethChartProps {
  // Support both sync data (array) and async data (function returning promise)
  data: any[] | (() => Promise<any[]>);
  options: Partial<ChoroplethChartOptions>;
  height?: string;
}

const ChoroplethChart: React.FC<ChoroplethChartProps> = ({
  data: dataProp,
  options,
  height = '600px',
}) => {
  const isClient = useIsClient();
  const currentTheme = useCarbonTheme();
  const { locale } = useLocale();
  const t = translate(locale);

  // State for chart data and loading
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Async load geoData from public folder (not bundled!)
  const [geoData, setGeoData] = useState<Topology | null>(null);
  const [geoError, setGeoError] = useState<Error | null>(null);

  // Handle async chart data fetching
  useEffect(() => {
    if (typeof dataProp === 'function') {
      // Async data - call the function to get promise
      setIsLoadingData(true);
      dataProp()
        .then((result) => {
          setChartData(result);
          setIsLoadingData(false);
        })
        .catch(() => {
          setChartData([]);
          setIsLoadingData(false);
        });
    } else {
      // Sync data - use directly
      setChartData(dataProp);
      setIsLoadingData(false);
    }
  }, [dataProp]);

  useEffect(() => {
    // Fetch TopoJSON data asynchronously (non-blocking, not in bundle)
    fetch('/data/geoData.topojson')
      .then((response) => {
        if (!response.ok) throw new Error('Failed to load geographic data');
        return response.json();
      })
      .then((data) => setGeoData(data))
      .catch((error) => setGeoError(error));
  }, []);

  if (!isClient) {
    return <ChartLoader height={height} />;
  }

  // Loading state (geoData or chart data)
  if (!geoData || isLoadingData) {
    return <ChartLoader height={height} />;
  }

  // Show loader if data is empty or invalid (graceful degradation)
  if (!chartData || chartData.length === 0) {
    return <ChartLoader height={height} />;
  }

  // Show loader if geoData failed to load (graceful degradation)
  if (geoError) {
    return <ChartLoader height={height} />;
  }

  const optimizedData = chartData
    .map((item: any, index: number) => ({
      ...item,
      id: `TR-${String(index + 1).padStart(2, '0')}`,
    }))
    .map((item: any) => {
      const originalValue = item.value;
      const magicValue = originalValue === 0 ? 0.1 : originalValue;
      return {
        ...item,
        value: Math.sqrt(magicValue), // Square root transformation
        originalValue: originalValue, // Store original value (for reference)
      };
    });

  const chartOptions: ChoroplethChartOptions = {
    height: height,
    experimental: true,
    geoData: geoData as any,
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
    thematic: {
      projection: 'geoMercator',
    },
    legend: {
      enabled: false,
    },
    toolbar: {
      enabled: true,
      controls: [{ type: 'Export as JPG' }, { type: 'Show as data-table' }],
    },
    tooltip: {
      enabled: true,
      valueFormatter: (value: number, _label?: string, data?: any) => {
        const originalValue = data?.originalValue ?? Math.round(value * value);
        if (originalValue === 0 || value < 0.5) return '0';
        return `${originalValue}`;
      },
    },
    tabularRepModal: {
      tableHeadingFormatter: (headings: string[]) => {
        return headings
          .filter((heading) => heading !== 'Country ID')
          .map((heading) => {
            if (heading === 'Country Name') return t.language.key;
            if (heading === 'Value') return t.language.value;
            return heading;
          });
      },
      tableCellFormatter: (cells: string[][]) => {
        const cellsWithoutId = cells.map((row) => {
          const name = row[1]; // row[0] = id, row[1] = name
          const transformedValue = parseFloat(row[2]); // Square root value
          const originalValue = Math.round(transformedValue * transformedValue);
          const displayValue = originalValue === 0 ? '0' : originalValue.toString();
          return [name, displayValue];
        });
        return cellsWithoutId.sort((a, b) => {
          const valueA = parseFloat(a[1]);
          const valueB = parseFloat(b[1]);
          return valueB - valueA;
        });
      },
    },
    ...options,
  };

  return <CarbonChoroplethChart data={optimizedData} options={chartOptions} />;
};

// Lazy-loaded version with built-in Suspense boundary and ChartLoader
const LazyChoroplethChartComponent = lazy(() => Promise.resolve({ default: ChoroplethChart }));

const LazyChoroplethChart: React.FC<ChoroplethChartProps> = (props) => (
  <Suspense fallback={<ChartLoader height={props.height || '600px'} />}>
    <LazyChoroplethChartComponent {...props} />
  </Suspense>
);

// Composition pattern: Attach Lazy as a property
interface ChoroplethChartComponent extends React.FC<ChoroplethChartProps> {
  Lazy: React.FC<ChoroplethChartProps>;
}

// Use Object.assign to properly extend the component
const ChoroplethChartWithLazy = Object.assign(ChoroplethChart, {
  Lazy: LazyChoroplethChart,
}) as ChoroplethChartComponent;

export default ChoroplethChartWithLazy;
