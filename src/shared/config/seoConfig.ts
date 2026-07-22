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

import seoConfigTr from './seo.json';
import seoConfigEn from './seo.en.json';

import type { LocalBusinessData } from '@shared/utils/schema-helpers';

/**
 * Site Configuration Type
 * Type-safe wrapper for site configuration data
 */
export interface SiteConfig {
  name: string;
  title: string;
  description: string;
  url: string;
  href?: string;
  locale: string;
  legalName?: string;
  author: {
    name: string;
    url?: string;
  };
  social: {
    twitter?: string | null;
    linkedin?: string | null;
    github?: string | null;
  };
  defaultImage: string;
  logo: string;
  email?: string;
  localBusiness: LocalBusinessData;
}

/**
 * SEO Configuration Map
 * Locale-based site configuration
 */
const SEO_CONFIG_MAP: Record<'tr' | 'en', SiteConfig> = {
  tr: seoConfigTr,
  en: seoConfigEn,
};

/**
 * Get site configuration for specific locale
 *
 * @param locale - Language code ('tr' or 'en')
 * @returns Locale-specific site configuration
 */
export const getSiteConfig = (locale: 'tr' | 'en' = 'tr'): SiteConfig => {
  const config = SEO_CONFIG_MAP[locale] || SEO_CONFIG_MAP.tr;
  const isClient = typeof window !== 'undefined';
  // Resolve URL at runtime for client-side rendering
  return {
    ...config,
    url: isClient ? window.location.origin : config.url,
    href: isClient ? `${window.location.origin}${window.location.pathname}` : config.url,
  };
};

// noinspection JSUnusedGlobalSymbols
export const siteConfig = getSiteConfig('tr');
