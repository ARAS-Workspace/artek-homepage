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
import { DataTableSkeleton } from '@carbon/react';

// Styles
import './styles/TableLoader.scss';

interface TableLoaderProps {
  columnCount?: number;
  rowCount?: number;
  showHeader?: boolean;
  showToolbar?: boolean;
  height?: string;
  compact?: boolean;
}

/**
 * TableLoader Component
 *
 * @example
 * <TableLoader
 *   columnCount={3}
 *   rowCount={10}
 *   showToolbar={true}
 *   showHeader={true}
 *   height="600px"
 * />
 */
export const TableLoader: React.FC<TableLoaderProps> = ({
  columnCount = 3,
  rowCount,
  showHeader = true,
  showToolbar = true,
  height = '600px',
  compact = false,
}) => {
  // Calculate row count based on height if not provided
  const calculatedRowCount = React.useMemo(() => {
    if (rowCount !== undefined) return rowCount;

    // Parse height string to number
    const heightValue = parseInt(height.replace(/\D/g, ''));
    const rowHeight = compact ? 32 : 48; // px per row (compact vs normal)
    const toolbarHeight = showToolbar ? 48 : 0;
    const headerHeight = showHeader ? 48 : 0;
    const paginationHeight = 48;

    const availableHeight = heightValue - toolbarHeight - headerHeight - paginationHeight;
    return Math.max(1, Math.floor(availableHeight / rowHeight));
  }, [height, rowCount, compact, showHeader, showToolbar]);

  return (
    <div className="table-loader-container" style={{ height }}>
      <DataTableSkeleton
        columnCount={columnCount}
        rowCount={calculatedRowCount}
        showHeader={showHeader}
        showToolbar={showToolbar}
        zebra={false}
      />
    </div>
  );
};

export default TableLoader;
