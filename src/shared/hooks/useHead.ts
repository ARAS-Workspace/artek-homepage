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

import { useEffect } from 'react';

const MANAGED_ATTR = 'data-head';

interface MetaTag {
  name?: string;
  property?: string;
  content: string;
  httpEquiv?: string;
}

interface LinkTag {
  rel: string;
  href: string;
  hrefLang?: string;
}

interface HeadConfig {
  title: string;
  lang?: string;
  meta?: MetaTag[];
  links?: LinkTag[];
  schemas?: any[];
}

/**
 * useHead — manages <head> tags with full cleanup on unmount/update.
 * Replaces react-helmet-async with zero dependencies.
 */
export function useHead(config: HeadConfig) {
  useEffect(() => {
    const head = document.head;
    const elements: HTMLElement[] = [];

    document.title = config.title;

    if (config.lang) {
      document.documentElement.lang = config.lang;
    }

    head.querySelectorAll(`[${MANAGED_ATTR}]`).forEach((el) => {
      el.parentNode?.removeChild(el);
    });

    if (config.meta) {
      for (const tag of config.meta) {
        const el = document.createElement('meta');
        if (tag.name) el.setAttribute('name', tag.name);
        if (tag.property) el.setAttribute('property', tag.property);
        if (tag.httpEquiv) el.setAttribute('http-equiv', tag.httpEquiv);
        el.setAttribute('content', tag.content);
        el.setAttribute(MANAGED_ATTR, 'true');
        head.appendChild(el);
        elements.push(el);
      }
    }

    if (config.links) {
      for (const tag of config.links) {
        const el = document.createElement('link');
        el.setAttribute('rel', tag.rel);
        el.setAttribute('href', tag.href);
        if (tag.hrefLang) el.setAttribute('hreflang', tag.hrefLang);
        el.setAttribute(MANAGED_ATTR, 'true');
        head.appendChild(el);
        elements.push(el);
      }
    }

    if (config.schemas) {
      for (const schema of config.schemas) {
        const el = document.createElement('script');
        el.setAttribute('type', 'application/ld+json');
        el.setAttribute(MANAGED_ATTR, 'true');
        el.textContent = JSON.stringify(schema);
        head.appendChild(el);
        elements.push(el);
      }
    }

    return () => {
      elements.forEach((el) => {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
    };
  }, [config.title, config.lang, config.meta, config.links, config.schemas]);
}