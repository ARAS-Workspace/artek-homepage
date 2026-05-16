// noinspection DuplicatedCode
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
import React, { useMemo } from 'react';

// External libraries
import { Content } from '@carbon/react';
import { Outlet } from 'react-router-dom';

// Internal modules
import Footer from '@shared/components/layout/Footer';
import AppHeaderSideNav from '@shared/components/layout/HeaderSideNav';
import { NavbarContent } from '@shared/components/layout/HeaderGlobals';
import { useLocale, useTheme } from '@shared/hooks';
import { Locale } from '@shared/translations';

// Local data
import headerContentTr from '@content/layout/tr/header.json';
import headerContentEn from '@content/layout/en/header.json';
import { getSideNavContent } from '@pages/services/consultancy/_data/sideNav';

const HEADER_CONTENT_MAP: Record<Locale, NavbarContent> = {
  tr: headerContentTr as NavbarContent,
  en: headerContentEn as NavbarContent,
};

interface ConsultancyLayoutProps {
  navContent?: NavbarContent;
}

/**
 * ConsultancyLayout Component
 *
 * TR: Danışmanlık sayfaları için side navigation içeren layout bileşeni.
 * Header, side nav, content area ve footer içerir.
 *
 * EN: Layout component with side navigation for consultancy pages.
 * Contains header, side nav, content area and footer.
 */
const ConsultancyLayout: React.FC<ConsultancyLayoutProps> = ({ navContent: navContentProp }) => {
  const { locale } = useLocale();
  const { theme, toggleTheme, isThemeTransitioning } = useTheme();

  const navContent = useMemo(() => {
    return navContentProp || HEADER_CONTENT_MAP[locale];
  }, [navContentProp, locale]);

  const sideNavContent = useMemo(() => {
    return getSideNavContent(locale);
  }, [locale]);

  return (
    <>
      <AppHeaderSideNav
        theme={theme}
        toggleTheme={toggleTheme}
        isThemeTransitioning={isThemeTransitioning}
        sideNavContent={sideNavContent}
        navContent={navContent}
      />
      <Content id="main-content" className="main-content-with-sidenav">
        <Outlet />
      </Content>
      <Footer />
    </>
  );
};

export default ConsultancyLayout;
