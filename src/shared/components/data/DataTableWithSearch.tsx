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
import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';

// External libraries
import {
  Button,
  DataTable,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
} from '@carbon/react';
import { Download } from '@carbon/icons-react';

// Internal modules
import { useLocale, useIsClient } from '@shared/hooks';
import { translate } from '@shared/translations';

// Local components
import TableLoader from './TableLoader';

// Styles
import './styles/DataTableWithSearch.scss';

interface TableHeader {
  key: string;
  header: string;
  isSortable?: boolean;
}

interface TableRow {
  id: string;
  [key: string]: any;
}

interface DataTableWithSearchProps {
  // Support both sync data (array) and async data (function returning promise)
  data: TableRow[] | (() => Promise<TableRow[]>);
  headers: TableHeader[];
  searchPlaceholder?: string;
  height?: string;
  minRows?: number;
  pageSizes?: number[];
  defaultPageSize?: number;
  searchFilter?: (row: TableRow, searchValue: string) => boolean;
  defaultSortKey?: string;
  defaultSortDirection?: 'ASC' | 'DESC';
  // Custom value extractor for CSV export (useful for React elements like Links)
  csvValueExtractor?: (row: TableRow, headerKey: string) => string | number;
}

/**
 * DataTableWithSearch Component
 *
 * @example
 * // Sync data
 * <DataTableWithSearch
 *   data={myData}
 *   headers={[
 *     { key: 'name', header: 'Name', isSortable: true },
 *     { key: 'value', header: 'Value', isSortable: true }
 *   ]}
 *   searchPlaceholder="Search items..."
 *   defaultSortKey="name"
 *   defaultSortDirection="ASC"
 * />
 *
 * @example
 * // Async data
 * <DataTableWithSearch
 *   data={() => getCenters('rd-centers', 'tr')}
 *   headers={headers}
 *   client:load
 * />
 *
 * @example
 * // Lazy loading (automatic TableLoader while loading component)
 * <DataTableWithSearch.Lazy
 *   data={myData}
 *   headers={headers}
 *   client:visible
 * />
 */
const DataTableWithSearch: React.FC<DataTableWithSearchProps> = ({
  data: dataProp,
  headers,
  searchPlaceholder,
  height = '600px',
  minRows = 10,
  pageSizes = [10, 20, 30, 50],
  defaultPageSize = 10,
  searchFilter,
  defaultSortKey = '',
  defaultSortDirection = 'DESC',
  csvValueExtractor,
}) => {
  const isClient = useIsClient();
  const { locale } = useLocale();
  const t = translate(locale);

  // State for table data and loading
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [searchValue, setSearchValue] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ASC' | 'DESC';
  }>({
    key: defaultSortKey,
    direction: defaultSortDirection,
  });

  // Handle async data fetching
  useEffect(() => {
    if (typeof dataProp === 'function') {
      // Async data - call the function to get promise
      setIsLoading(true);
      dataProp()
        .then((result) => {
          setTableData(result);
          setIsLoading(false);
        })
        .catch(() => {
          setTableData([]);
          setIsLoading(false);
        });
    } else {
      // Sync data - use directly
      setTableData(dataProp);
      setIsLoading(false);
    }
  }, [dataProp]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortConfig.key, sortConfig.direction]);

  // Default search filter: search all string and number fields
  const defaultSearchFilter = (row: TableRow, search: string): boolean => {
    const lowerSearch = search.toLowerCase();
    return Object.values(row).some((value) => {
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowerSearch);
      }
      if (typeof value === 'number') {
        return value.toString().includes(lowerSearch);
      }
      return false;
    });
  };

  const filteredRows = useMemo(() => {
    if (!searchValue) return tableData;

    const filterFn = searchFilter || defaultSearchFilter;
    return tableData.filter((row: TableRow) => filterFn(row, searchValue));
  }, [tableData, searchValue, searchFilter]);

  // Apply sorting BEFORE pagination
  const sortedRows = useMemo(() => {
    if (!sortConfig.key) {
      return filteredRows;
    }

    return [...filteredRows].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Numeric comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'ASC' ? aValue - bValue : bValue - aValue;
      }

      // String comparison
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (aStr < bStr) return sortConfig.direction === 'ASC' ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === 'ASC' ? 1 : -1;
      return 0;
    });
  }, [filteredRows, sortConfig]);

  const totalItems = sortedRows.length;

  // Calculate pagination AFTER sorting
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRows = sortedRows.slice(startIndex, endIndex);

  // Minimum row guarantee - add empty rows if needed
  const emptyRowsCount = Math.max(0, minRows - paginatedRows.length);
  const emptyRows = Array.from({ length: emptyRowsCount }, (_, i) => {
    const emptyRow: TableRow = { id: `empty-${i}` };
    headers.forEach((header) => {
      emptyRow[header.key] = '\u00A0'; // Non-breaking space
    });
    return emptyRow;
  });

  const displayRows = [...paginatedRows, ...emptyRows];

  const handleSearch = (event: any) => {
    setSearchValue(event.target.value);
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    if (typeof window === 'undefined') return;

    const csvHeaders = headers.map((h) => h.header).join(',');

    // Use sortedRows to preserve current table sorting in CSV export
    const csvRows = sortedRows.map((row) => {
      return headers
        .map((header) => {
          // Use custom extractor if provided, otherwise use raw value
          const value = csvValueExtractor ? csvValueExtractor(row, header.key) : row[header.key];

          // Handle values that might contain commas or quotes
          if (
            typeof value === 'string' &&
            (value.includes(',') || value.includes('"') || value.includes('\n'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? '';
        })
        .join(',');
    });

    const csvContent = [csvHeaders, ...csvRows].join('\n');

    // Create blob and download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `data-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isClient) {
    return (
      <TableLoader
        columnCount={headers.length}
        showToolbar={true}
        showHeader={true}
        height={height}
        rowCount={minRows}
      />
    );
  }
  // Loading state
  if (isLoading) {
    return (
      <TableLoader
        columnCount={headers.length}
        showToolbar={true}
        showHeader={true}
        height={height}
        rowCount={minRows}
      />
    );
  }

  // Show loader if data is empty or invalid (graceful degradation)
  if (!tableData || tableData.length === 0) {
    return (
      <TableLoader
        columnCount={headers.length}
        showToolbar={true}
        showHeader={true}
        height={height}
        rowCount={minRows}
      />
    );
  }

  return (
    <div style={{ height, display: 'flex', flexDirection: 'column' }}>
      <DataTable rows={displayRows} headers={headers} isSortable>
        {({
          rows,
          headers,
          getTableProps,
          getHeaderProps,
          getRowProps,
          getToolbarProps,
          onInputChange,
        }: any) => (
          <TableContainer
            style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          >
            <TableToolbar {...getToolbarProps()}>
              <TableToolbarContent>
                <TableToolbarSearch
                  persistent
                  placeholder={searchPlaceholder || t.dataTable.searchPlaceholder}
                  onChange={(e: any) => {
                    onInputChange(e);
                    handleSearch(e);
                  }}
                />
                <Button
                  kind="ghost"
                  size="lg"
                  renderIcon={Download}
                  iconDescription={t.dataTable.exportCSV}
                  onClick={exportToCSV}
                  hasIconOnly
                />
              </TableToolbarContent>
            </TableToolbar>
            <div style={{ flex: 1, overflow: 'auto' }}>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header: any) => {
                      const headerProps = getHeaderProps({ header });
                      const { key, ...restHeaderProps } = headerProps;

                      // Determine sort direction for this header
                      const currentSortDirection =
                        sortConfig.key === header.key ? sortConfig.direction : 'NONE';

                      return (
                        <TableHeader
                          key={header.key}
                          {...restHeaderProps}
                          isSortable={header.isSortable || false}
                          sortDirection={currentSortDirection}
                          onClick={() => {
                            if (header.isSortable) {
                              let newDirection: 'ASC' | 'DESC';

                              if (sortConfig.key !== header.key) {
                                // Switching to a different column - start with default direction
                                newDirection = defaultSortDirection;
                              } else {
                                // Same column - toggle: ASC <-> DESC
                                newDirection = sortConfig.direction === 'ASC' ? 'DESC' : 'ASC';
                              }

                              setSortConfig({
                                key: header.key,
                                direction: newDirection,
                              });
                            }
                          }}
                        >
                          {header.header}
                        </TableHeader>
                      );
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row: any) => {
                    const rowProps = getRowProps({ row });
                    const { key, ...restRowProps } = rowProps;
                    const isEmptyRow = row.id.startsWith('empty-');

                    return (
                      <TableRow
                        key={row.id}
                        {...restRowProps}
                        style={{
                          opacity: isEmptyRow ? 0.3 : 1,
                          pointerEvents: isEmptyRow ? 'none' : 'auto',
                        }}
                      >
                        {row.cells.map((cell: any) => (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <Pagination
              page={currentPage}
              pageSize={pageSize}
              pageSizes={pageSizes}
              totalItems={totalItems}
              backwardText={t.pagination.backwardText}
              forwardText={t.pagination.forwardText}
              itemsPerPageText={t.pagination.itemsPerPageText}
              itemRangeText={(min, max, total) =>
                `${min}–${max} ${t.pagination.ofText} ${total} ${t.pagination.itemsText}`
              }
              pageRangeText={(current, total) =>
                `${current} ${t.pagination.ofText} ${total} ${t.pagination.pagesText}`
              }
              onChange={({ page, pageSize }: { page: number; pageSize: number }) => {
                setCurrentPage(page);
                setPageSize(pageSize);
              }}
            />
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
};

// Lazy-loaded version with built-in Suspense boundary and TableLoader
const LazyDataTableWithSearchComponent = lazy(() =>
  Promise.resolve({ default: DataTableWithSearch })
);

const LazyDataTableWithSearch: React.FC<DataTableWithSearchProps> = (props) => (
  <Suspense
    fallback={
      <TableLoader
        columnCount={props.headers.length}
        showToolbar={true}
        showHeader={true}
        height={props.height || '600px'}
        rowCount={props.minRows || 10}
      />
    }
  >
    <LazyDataTableWithSearchComponent {...props} />
  </Suspense>
);

// Composition pattern: Attach Lazy as a property
interface DataTableWithSearchComponent extends React.FC<DataTableWithSearchProps> {
  Lazy: React.FC<DataTableWithSearchProps>;
}

// Use Object.assign to properly extend the component
const DataTableWithSearchWithLazy = Object.assign(DataTableWithSearch, {
  Lazy: LazyDataTableWithSearch,
}) as DataTableWithSearchComponent;

export default DataTableWithSearchWithLazy;
