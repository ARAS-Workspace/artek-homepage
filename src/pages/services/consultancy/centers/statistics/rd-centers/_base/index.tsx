import React, { useMemo } from 'react';
import SEO from '@shared/components/content/SEO.tsx';
import MDXPageRenderer from '@shared/components/content/MDXPageRenderer.tsx';

import ContentTr from '../index.mdx';
import ContentEn from '../index.en.mdx';

import '../style.scss';

import seoConfigTr from '../data/seo/tr/data.json';
import seoConfigEn from '../data/seo/en/data.json';

import { useLocale } from '@shared/hooks';
import { getSiteConfig } from '@shared/config/seoConfig';
import { createDefaultSiteSchemas, createWebSiteRef } from '@shared/utils/schema-helpers';
import { createBreadcrumbSchema } from '@pages/services/consultancy/_data/schemas';

const SEO_MAP = {
  tr: seoConfigTr,
  en: seoConfigEn,
};

const CONTENT_MAP = {
  tr: ContentTr,
  en: ContentEn,
};

const CentersStatisticsRDCenters: React.FC = () => {
  const { locale } = useLocale();
  const siteConfig = getSiteConfig(locale);

  // Get content for current locale
  const Content = CONTENT_MAP[locale] || CONTENT_MAP.tr;

  // SEO configuration
  const seoConfig = useMemo(
    () => ({
      ...(SEO_MAP[locale] || SEO_MAP.tr),
    }),
    [locale]
  );

  // Page-specific schemas
  const schemas = useMemo(() => {
    const breadcrumbListSchema = createBreadcrumbSchema(siteConfig, locale, [
      {
        name: { tr: 'Ar-Ge Merkezleri', en: 'R&D Centers' },
        path: '/services/consultancy/centers/statistics/rd-centers',
      },
    ]);
    const webPageSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: locale === 'tr' ? 'Ar-Ge Merkezleri İstatistikleri' : 'R&D Centers Statistics',
      description: seoConfig.description,
      url: siteConfig.href,
      isPartOf: createWebSiteRef(locale),
      about: {
        '@type': 'Thing',
        name: locale === 'tr' ? 'İstatistikler' : 'Statistics',
      },
    };
    const datasetSchema = {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name:
        locale === 'tr'
          ? 'Türkiye Ar-Ge Merkezleri İstatistikleri'
          : 'Turkey R&D Centers Statistics',
      description:
        locale === 'tr'
          ? 'T.C. Sanayi ve Teknoloji Bakanlığı resmi verilerine dayanan Ar-Ge merkezleri istatistikleri. Personel, proje, patent, sektörel ve bölgesel dağılım analizleri.'
          : 'R&D centers statistics based on official data from the Republic of Turkey Ministry of Industry and Technology. Personnel, project, patent, sectoral and regional distribution analyses.',
      creator: {
        '@type': 'Organization',
        name:
          locale === 'tr'
            ? 'T.C. Sanayi ve Teknoloji Bakanlığı'
            : 'Republic of Turkey Ministry of Industry and Technology',
        url: 'https://www.sanayi.gov.tr',
      },
      publisher: {
        '@type': 'Organization',
        '@id': `${siteConfig.url}/#organization`,
        name: siteConfig.name,
      },
      license: 'https://creativecommons.org/licenses/by/4.0/',
      temporalCoverage: '2024',
      spatialCoverage: locale === 'tr' ? 'Türkiye' : 'Turkey',
    };
    return [
      ...createDefaultSiteSchemas(locale),
      breadcrumbListSchema,
      webPageSchema,
      datasetSchema,
    ];
  }, [locale, siteConfig, seoConfig.description]);

  return (
    <>
      <SEO {...seoConfig} schemas={schemas} />
      <MDXPageRenderer content={Content} />
    </>
  );
};

export default CentersStatisticsRDCenters;
