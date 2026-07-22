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
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@carbon/react';

// Internal modules
import { useIsClient } from '@shared/hooks';

// Styles
import './styles/ContentTabs.scss';

interface TabItem {
  label: string;
  content: React.ComponentType<any> | any;
}

interface ContentTabsProps {
  tabs: TabItem[];
  contained?: boolean;
  className?: string;
}

/**
 * ContentTabs Component
 *
 * @example
 * <ContentTabs
 *   tabs={[
 *     { label: 'Overview', content: OverviewComponent },
 *     { label: 'Details', content: DetailsComponent }
 *   ]}
 *   contained={true}
 *   className="my-tabs"
 * />
 */
const ContentTabs: React.FC<ContentTabsProps> = ({ tabs, contained = true, className = '' }) => {
  const isClient = useIsClient();

  if (!tabs || tabs.length === 0) {
    console.warn('ContentTabs: No tabs provided');
    return null;
  }

  // Prerender: render all tab contents stacked so Playwright captures full content
  if (!isClient) {
    return (
      <div className="content-tabs__prerender">
        {tabs.map((tab, index) => {
          const ContentComponent = tab.content;
          return (
            <div key={index}>
              <ContentComponent />
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`content-tabs ${className}`}>
      <Tabs>
        <TabList aria-label="Content Tabs" contained={contained}>
          {tabs.map((tab, index) => (
            <Tab key={`tab-${index}`}>{tab.label}</Tab>
          ))}
        </TabList>
        <TabPanels>
          {tabs.map((tab, index) => {
            const ContentComponent = tab.content;
            return (
              <TabPanel key={`panel-${index}`}>
                <div className="content-tabs__panel">
                  <ContentComponent />
                </div>
              </TabPanel>
            );
          })}
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default ContentTabs;
