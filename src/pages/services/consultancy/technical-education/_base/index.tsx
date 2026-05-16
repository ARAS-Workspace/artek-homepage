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
import { createDefaultSiteSchemas } from '@shared/utils/schema-helpers';

import { createBreadcrumbSchema, createProfessionalServiceSchema } from '../../_data/schemas';
import type { SimpleFaqItem } from '@shared/components/ui/SimpleFaq.tsx';
import faqContentTr from '@pages/services/consultancy/technical-education/data/faq/tr/data.json';
import faqContentEn from '@pages/services/consultancy/technical-education/data/faq/en/data.json';

const SEO_MAP = {
  tr: seoConfigTr,
  en: seoConfigEn,
};
const CONTENT_MAP = {
  tr: ContentTr,
  en: ContentEn,
};
const FAQ_CONTENT_MAP: Record<'tr' | 'en', SimpleFaqItem[]> = {
  tr: faqContentTr as SimpleFaqItem[],
  en: faqContentEn as SimpleFaqItem[],
};
const TechnicalEducation: React.FC = () => {
  const { locale } = useLocale();
  const siteConfig = getSiteConfig(locale);

  const faqContent = useMemo(() => FAQ_CONTENT_MAP[locale], [locale]);
  const Content = CONTENT_MAP[locale] || CONTENT_MAP.tr;

  const seoConfig = useMemo(
    () => ({
      ...(SEO_MAP[locale] || SEO_MAP.tr),
    }),
    [locale]
  );

  const schemas = useMemo(() => {
    const breadcrumbListSchema = createBreadcrumbSchema(siteConfig, locale, [
      {
        name: { tr: 'Technical Education', en: 'Teknik Eğitim' },
        path: '/services/consultancy/technical-education',
      },
    ]);
    const webPageSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: siteConfig.name,
      description: seoConfig.description,
      url: siteConfig.href,
      isPartOf: {
        '@type': 'WebSite',
        name: 'ARTEK',
        url: siteConfig.url,
      },
      about: {
        '@type': 'Thing',
        name: locale === 'tr' ? 'Teknik Danışmanlık' : 'Technical Consultancy',
      },
    };
    const professionalServiceSchema = createProfessionalServiceSchema(siteConfig, locale);
    const faqPageSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqContent.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };
    return [
      ...createDefaultSiteSchemas(locale),
      breadcrumbListSchema,
      webPageSchema,
      professionalServiceSchema,
      faqPageSchema,
    ];
  }, [faqContent, locale, siteConfig, seoConfig.description]);

  return (
    <>
      <SEO {...seoConfig} schemas={schemas} />
      <MDXPageRenderer content={Content} />
    </>
  );
};

export default TechnicalEducation;
