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
import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

// Internal modules
import { DEFAULT_LOCALE, type Locale, translations } from '@shared/translations';

interface LocaleContextValue {
  locale: Locale;
  changeLocale: (newLocale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

/**
 * LocaleProvider Component
 *
 * @example
 * <LocaleProvider>
 *   <App />
 * </LocaleProvider>
 */
export const LocaleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>(() => {
    try {
      // 1. URL parameter (pre-rendering control)
      const urlLocale = new URLSearchParams(window.location.search).get('locale');
      if (urlLocale && urlLocale in translations) return urlLocale as Locale;

      // 2. Cookie (user explicit choice - persistent)
      const cookieLocale = document.cookie.match(/preferred_locale=(\w+)/)?.[1];
      if (cookieLocale && cookieLocale in translations) return cookieLocale as Locale;

      // 3. HTML lang attribute (server decision: cookie or Accept-Language)
      const htmlLang = document.documentElement.getAttribute('lang');
      if (htmlLang && htmlLang in translations) return htmlLang as Locale;

      // 4. Browser language fallback
      const browserLang = navigator.language.split('-')[0];
      if (browserLang in translations) return browserLang as Locale;

      // 5. Default (tr)
      return DEFAULT_LOCALE;
    } catch {
      return DEFAULT_LOCALE;
    }
  });

  // Keep <html lang> in sync with locale (independent of SEO mount)
  document.documentElement.lang = locale;

  const changeLocale = useCallback((newLocale: Locale) => {
    setLocale(newLocale);
    document.documentElement.lang = newLocale;

    // Set cookie (single source of truth)
    try {
      const maxAge = 60 * 60 * 24 * 365;
      const secure = window.location.protocol === 'https:' ? '; Secure' : '';

      document.cookie = `preferred_locale=${newLocale}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
    } catch (error) {
      console.warn('Failed to set cookie:', error);
    }
  }, []);

  const value = useMemo(
    () => ({
      locale,
      changeLocale,
    }),
    [locale, changeLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

/**
 * useLocale Hook
 *
 * @returns {LocaleContextValue} Object with locale and changeLocale
 * @throws {Error} If used outside LocaleProvider
 *
 * @example
 * const MyComponent = () => {
 *   const { locale, changeLocale } = useLocale();
 *
 *   return (
 *     <button onClick={() => changeLocale(locale === 'tr' ? 'en' : 'tr')}>
 *       Current: {locale}
 *     </button>
 *   );
 * };
 */
export const useLocale = (): LocaleContextValue => {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }

  return context;
};
