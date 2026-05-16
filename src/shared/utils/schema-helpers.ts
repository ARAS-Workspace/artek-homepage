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
    url: siteConfig.url,
    logo: {
      '@type': 'ImageObject',
      url: logoUrl,
    },
    description: siteConfig.description,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['Turkish', 'English'],
    },
    sameAs: Object.values(siteConfig.social).filter(Boolean),
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
 *   telephone: '+905335253773',
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
    ...(data.priceRange && { priceRange: data.priceRange }),
    ...(data.image && { image: data.image }),
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
    sameAs: Object.values(siteConfig.social).filter(Boolean),
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
