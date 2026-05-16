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

import React, { useEffect, useMemo } from 'react';

import { getSiteConfig } from '@shared/config/seoConfig';
import { generateTitle, generateUrl, generateImageUrl } from '@shared/utils/seo-utils';
import { useLocale, useHead } from '@shared/hooks';
import { useSEO } from '@shared/contexts/SEOContext';

export interface SEOProps {
  /** Page title (without site name) */
  title?: string;
  /** Page description for meta tags */
  description?: string;
  /** OG image path or full URL */
  image?: string;
  /** Page path (e.g., "/contact") */
  path?: string;
  /** Content type for Open Graph */
  type?: 'website' | 'article' | 'profile';
  /** Disable search engine indexing */
  noIndex?: boolean;
  /** Article publish date (ISO 8601 format) */
  publishedTime?: string;
  /** Article modified date (ISO 8601 format) */
  modifiedTime?: string;
  /** Canonical URL override */
  canonical?: string;
  /** JSON-LD schemas to inject (callers add Organization/LocalBusiness explicitly via createDefaultSiteSchemas) */
  schemas?: any[];
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  image,
  path,
  type = 'website',
  noIndex = false,
  publishedTime,
  modifiedTime,
  canonical,
  schemas = [],
}) => {
  const { locale } = useLocale();
  const { updateMetadata } = useSEO();

  const siteConfig = getSiteConfig(locale);
  const finalDescription = description || siteConfig.description;
  const fullTitle = generateTitle(title, locale);
  const currentPath =
    path || (typeof window !== 'undefined' ? window.location.pathname : undefined);
  const fullUrl = canonical || generateUrl(currentPath, locale);
  const fullImage = generateImageUrl(image, locale);
  const robotsContent = noIndex ? 'noindex, nofollow' : 'index, follow';

  useEffect(() => {
    updateMetadata({
      title: fullTitle,
      description: finalDescription,
      path: path || window.location.pathname,
      locale,
    });
  }, [fullTitle, finalDescription, path, locale, updateMetadata]);

  const meta = useMemo(() => {
    const tags = [
      { name: 'title', content: fullTitle },
      { name: 'description', content: finalDescription },
      { name: 'author', content: siteConfig.author.name },
      { name: 'robots', content: robotsContent },
      { httpEquiv: 'content-language', content: locale },
      { property: 'og:type', content: type },
      { property: 'og:url', content: fullUrl },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: finalDescription },
      { property: 'og:image', content: fullImage },
      { property: 'og:site_name', content: siteConfig.name },
      { property: 'og:locale', content: siteConfig.locale },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:url', content: fullUrl },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: finalDescription },
      { name: 'twitter:image', content: fullImage },
    ];

    if (type === 'article') {
      if (publishedTime) tags.push({ property: 'article:published_time', content: publishedTime });
      if (modifiedTime) tags.push({ property: 'article:modified_time', content: modifiedTime });
      tags.push({ property: 'article:author', content: siteConfig.author.name });
    }

    if (siteConfig.social.twitter) {
      tags.push({ name: 'twitter:site', content: siteConfig.social.twitter });
    }

    return tags;
  }, [
    fullTitle,
    finalDescription,
    fullUrl,
    fullImage,
    type,
    robotsContent,
    locale,
    siteConfig,
    publishedTime,
    modifiedTime,
  ]);

  const links = useMemo(() => [{ rel: 'canonical', href: fullUrl }], [fullUrl]);

  useHead({
    title: fullTitle,
    lang: locale,
    meta,
    links,
    schemas,
  });

  return null;
};

export default SEO;