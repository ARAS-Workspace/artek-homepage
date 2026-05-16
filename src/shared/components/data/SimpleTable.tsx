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
import React from 'react';

// External libraries
import {
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';

// Styles
import './styles/SimpleTable.scss';

interface SimpleTableProps {
  children: React.ReactNode;
}

/**
 * SimpleTable Component
 *
 * @example
 * // In MDX files, markdown tables are automatically converted:
 * | Header 1 | Header 2 |
 * | -------- | -------- |
 * | Cell 1   | Cell 2   |
 */
const SimpleTable: React.FC<SimpleTableProps> = ({ children }) => {
  const extractTableData = () => {
    // Children are already table parts (thead, tbody) - not wrapped in <table>
    const childrenArray = React.Children.toArray(children);

    const thead = childrenArray.find(
      (child: any) => React.isValidElement(child) && child.type === 'thead'
    ) as React.ReactElement<any> | undefined;

    const tbody = childrenArray.find(
      (child: any) => React.isValidElement(child) && child.type === 'tbody'
    ) as React.ReactElement<any> | undefined;

    // Extract headers from thead > tr > th
    const headers: Array<{ key: string; header: string }> = [];
    if (thead) {
      const headerRow = React.Children.only(thead.props.children) as React.ReactElement<any>;
      const headerCells = React.Children.toArray(headerRow.props.children);

      headerCells.forEach((cell: any, index) => {
        headers.push({
          key: `col-${index}`,
          header: cell.props.children,
        });
      });
    }

    // Extract rows from tbody > tr > td
    const rows: Array<{ id: string; [key: string]: any }> = [];
    if (tbody) {
      const bodyRows = React.Children.toArray(tbody.props.children);

      bodyRows.forEach((row: any, rowIndex) => {
        const cells = React.Children.toArray(row.props.children);
        const rowData: { id: string; [key: string]: any } = {
          id: `row-${rowIndex}`,
        };

        cells.forEach((cell: any, cellIndex) => {
          rowData[`col-${cellIndex}`] = cell.props.children;
        });

        rows.push(rowData);
      });
    }

    return { headers, rows };
  };

  const { headers, rows } = extractTableData();

  if (headers.length === 0 || rows.length === 0) {
    return <table>{children}</table>;
  }

  return (
    <DataTable rows={rows} headers={headers}>
      {({ rows, headers, getTableProps, getHeaderProps, getRowProps }: any) => (
        <TableContainer>
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {headers.map((header: any) => {
                  const headerProps = getHeaderProps({ header });
                  const { key, ...restHeaderProps } = headerProps;
                  return (
                    <TableHeader key={header.key} {...restHeaderProps}>
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
                return (
                  <TableRow key={row.id} {...restRowProps}>
                    {row.cells.map((cell: any) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DataTable>
  );
};

export default SimpleTable;
