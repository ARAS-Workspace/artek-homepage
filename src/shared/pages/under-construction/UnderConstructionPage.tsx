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

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@carbon/react';
import { ArrowLeft, Construction } from '@carbon/icons-react';

import SEO from '@shared/components/content/SEO';
import { useLocale } from '@shared/hooks';
import { translate } from '@shared/translations';

import DinoGame from '@shared/components/games/DinoGame';

// SEO configurations
import seoConfigTr from './data/seo/tr/data.json';
import seoConfigEn from './data/seo/en/data.json';

import './styles/main.scss';

// SEO content map
const SEO_MAP = {
  tr: seoConfigTr,
  en: seoConfigEn,
};

/**
 * Under Construction Page
 * Layout-free, general-purpose under construction page
 */
const UnderConstructionPage: React.FC = () => {
  const navigate = useNavigate();
  const { locale } = useLocale();
  const t = translate(locale);

  // SEO configuration
  const seoConfig = useMemo(() => SEO_MAP[locale] || SEO_MAP.tr, [locale]);

  // noIndex page: structured data would never be consumed, so none is emitted.
  return (
    <>
      <SEO {...seoConfig} noIndex />
      <div className="under-construction-container">
        <div className="under-construction-content">
          <div className="under-construction-icon-wrapper">
            <Construction className="under-construction-icon" />
          </div>

          <h1 className="under-construction-code">{t.errorPages.underConstruction.code}</h1>
          <h2 className="under-construction-title">{t.errorPages.underConstruction.title}</h2>
          <p className="under-construction-description">
            {t.errorPages.underConstruction.description}
          </p>

          <div className="under-construction-game-area">
            <DinoGame.Lazy theme="under-construction" />
          </div>

          <div className="under-construction-actions">
            <Button renderIcon={ArrowLeft} onClick={() => navigate('/')} size="lg">
              {t.errorPages.underConstruction.backHome}
            </Button>
            <Button kind="ghost" onClick={() => navigate(-1)} size="lg">
              {t.errorPages.underConstruction.goBack}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UnderConstructionPage;
