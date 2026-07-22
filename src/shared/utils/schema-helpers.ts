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

import { getSiteConfig } from '@shared/config/seoConfig';
import type { Locale } from '@shared/translations';

/**
 * Prefix a site-relative asset path with the canonical origin —
 * schema.org consumers (Google) expect absolute URLs in logo/image fields.
 */
const absoluteUrl = (path: string, origin: string) =>
  path.startsWith('/') ? `${origin}${path}` : path;

/**
 * LocalBusiness schema data
 */
export interface LocalBusinessData {
  address: {
    street: string;
    city: string;
    region?: string;
    postalCode?: string;
    country: string;
  };
  telephone?: string;
  priceRange?: string;
  image?: string;
  openingHours?: Array<{
    days: string[];
    opens: string;
    closes: string;
  }>;
  geo?: {
    latitude: number;
    longitude: number;
  };
}

// ============================================================================
// Schema builder functions
// ============================================================================

/**
 * Creates an Organization schema object
 *
 * @param logoUrl - Full URL to organization logo
 * @param locale - Language code ('tr' or 'en')
 * @returns Organization schema object
 */
export const createOrganizationSchema = (logoUrl: string, locale: 'tr' | 'en' = 'tr') => {
  const siteConfig = getSiteConfig(locale);
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    ...(siteConfig.legalName && { legalName: siteConfig.legalName }),
    url: siteConfig.url,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl(logoUrl, siteConfig.url),
    },
    description: siteConfig.description,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      telephone: siteConfig.localBusiness.telephone,
      ...(siteConfig.email && { email: siteConfig.email }),
      availableLanguage: ['Turkish', 'English'],
    },
    ...(Object.values(siteConfig.social).some(Boolean) && {
      sameAs: Object.values(siteConfig.social).filter(Boolean),
    }),
  };
};

/**
 * Canonical WebSite reference node shared by every page's WebPage.isPartOf —
 * single source instead of per-page inline literals.
 *
 * @param locale - Language code ('tr' or 'en')
 */
export const createWebSiteRef = (locale: 'tr' | 'en' = 'tr') => {
  const siteConfig = getSiteConfig(locale);
  return {
    '@type': 'WebSite',
    '@id': `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: siteConfig.url,
  };
};

/**
 * Creates a LocalBusiness schema object
 *
 * @param data - LocalBusiness schema data
 * @param locale - Language code ('tr' or 'en')
 * @returns LocalBusiness schema object
 *
 * @example
 * createLocalBusinessSchema({
 *   address: {
 *     street: 'Çalca Osb Mah. 1 Cad. No:1/3 İç Kapı:218',
 *     city: 'Kütahya',
 *     region: 'Kütahya',
 *     country: 'TR'
 *   },
 *   telephone: '+902746060457',
 *   openingHours: [{
 *     days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
 *     opens: '09:00',
 *     closes: '18:00'
 *   }]
 * }, 'tr')
 */
export const createLocalBusinessSchema = (data: LocalBusinessData, locale: 'tr' | 'en' = 'tr') => {
  const siteConfig = getSiteConfig(locale);
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteConfig.url}/#localbusiness`,
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: data.telephone,
    ...(siteConfig.email && { email: siteConfig.email }),
    ...(data.priceRange && { priceRange: data.priceRange }),
    ...(data.image && { image: absoluteUrl(data.image, siteConfig.url) }),
    address: {
      '@type': 'PostalAddress',
      streetAddress: data.address.street,
      addressLocality: data.address.city,
      ...(data.address.region && { addressRegion: data.address.region }),
      ...(data.address.postalCode && { postalCode: data.address.postalCode }),
      addressCountry: data.address.country,
    },
    ...(data.geo && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: data.geo.latitude,
        longitude: data.geo.longitude,
      },
    }),
    ...(data.openingHours && {
      openingHoursSpecification: data.openingHours.map((hours) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: hours.days,
        opens: hours.opens,
        closes: hours.closes,
      })),
    }),
    ...(Object.values(siteConfig.social).some(Boolean) && {
      sameAs: Object.values(siteConfig.social).filter(Boolean),
    }),
  };
};

/**
 * Creates the default site-wide schema pair (Organization + LocalBusiness).
 * Call this explicitly in pages that should expose the global business identity.
 *
 * @param locale - Language code ('tr' or 'en')
 * @returns Array of [Organization, LocalBusiness] schemas
 */
export const createDefaultSiteSchemas = (locale: Locale = 'tr') => {
  const siteConfig = getSiteConfig(locale);
  return [
    createOrganizationSchema(siteConfig.logo, locale),
    createLocalBusinessSchema(siteConfig.localBusiness, locale),
  ];
};
