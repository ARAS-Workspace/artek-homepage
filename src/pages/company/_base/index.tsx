// noinspection DuplicatedCode

import React, { useMemo } from 'react';
import SEO from '@shared/components/content/SEO.tsx';
import MDXPageRenderer from '@shared/components/content/MDXPageRenderer.tsx';

import '../style.scss';

import seoConfigTr from '../data/seo/tr/data.json';
import seoConfigEn from '../data/seo/en/data.json';

import ContentTr from '../index.mdx';
import ContentEn from '../index.en.mdx';

import { useLocale } from '@shared/hooks';
import { getSiteConfig } from '@shared/config/seoConfig';
import { createDefaultSiteSchemas, createWebSiteRef } from '@shared/utils/schema-helpers';

const SEO_MAP = {
  tr: seoConfigTr,
  en: seoConfigEn,
};
const CONTENT_MAP = {
  tr: ContentTr,
  en: ContentEn,
};
const Company: React.FC = () => {
  const { locale } = useLocale();
  const siteConfig = getSiteConfig(locale);

  const Content = CONTENT_MAP[locale] || CONTENT_MAP.tr;

  const seoConfig = useMemo(
    () => ({
      ...(SEO_MAP[locale] || SEO_MAP.tr),
    }),
    [locale]
  );

  const schemas = useMemo(() => {
    const webPageSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: seoConfig.title,
      description: seoConfig.description,
      url: siteConfig.href,
      isPartOf: createWebSiteRef(locale),
      about: {
        '@type': 'Thing',
        name: locale === 'tr' ? 'Kurumsal Bilgiler' : 'Company Information',
      },
    };
    return [...createDefaultSiteSchemas(locale), webPageSchema];
  }, [locale, siteConfig, seoConfig.description]);

  return (
    <>
      <SEO {...seoConfig} schemas={schemas} />
      <MDXPageRenderer content={Content} />
    </>
  );
};

export default Company;
