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

import type { SimpleFaqItem } from '@shared/components/ui/SimpleFaq.tsx';
import faqContentTr from '../data/faq/tr/data.json';
import faqContentEn from '../data/faq/en/data.json';
import flowChartTr from '../data/flow-chart/tr/data.prose.md?raw';
import flowChartEn from '../data/flow-chart/en/data.prose.md?raw';
import surveyDesignTr from '../data/survey-design/tr/questions.json';
import surveyDesignEn from '../data/survey-design/en/questions.json';
import surveyRdTr from '../data/survey-rd/tr/questions.json';
import surveyRdEn from '../data/survey-rd/en/questions.json';
import {
  createBreadcrumbSchema,
  createProfessionalServiceSchema,
} from '@pages/services/consultancy/_data/schemas';

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
const FLOW_CHART_MAP: Record<'tr' | 'en', string> = {
  tr: flowChartTr,
  en: flowChartEn,
};
const SURVEY_DESIGN_MAP: Record<'tr' | 'en', string[]> = {
  tr: surveyDesignTr as string[],
  en: surveyDesignEn as string[],
};
const SURVEY_RD_MAP: Record<'tr' | 'en', string[]> = {
  tr: surveyRdTr as string[],
  en: surveyRdEn as string[],
};
const CentersSetup: React.FC = () => {
  const { locale } = useLocale();
  const siteConfig = getSiteConfig(locale);

  const faqContent = useMemo(() => FAQ_CONTENT_MAP[locale], [locale]);
  const flowChartContent = useMemo(() => FLOW_CHART_MAP[locale], [locale]);
  const surveyDesignContent = useMemo(
    () => SURVEY_DESIGN_MAP[locale].map((q) => ({ criteria: q })),
    [locale]
  );
  const surveyRdContent = useMemo(
    () => SURVEY_RD_MAP[locale].map((q) => ({ criteria: q })),
    [locale]
  );
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
        name: { tr: 'Merkez Kurulum Danışmanlığı', en: 'Center Setup Consultancy' },
        path: '/services/consultancy/centers/setup',
      },
    ]);
    const webPageSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name:
        locale === 'tr'
          ? 'Ar-Ge ve Tasarım Merkezi Kurulum Danışmanlığı'
          : 'R&D and Design Center Setup Consultancy',
      description: seoConfig.description,
      url: siteConfig.href,
      isPartOf: {
        '@type': 'WebSite',
        name: 'ARTEK',
        url: siteConfig.url,
      },
      about: {
        '@type': 'Thing',
        name: locale === 'tr' ? 'Merkez Kurulum Danışmanlığı' : 'Center Setup Consultancy',
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
  }, [
    faqContent,
    flowChartContent,
    surveyDesignContent,
    surveyRdContent,
    locale,
    siteConfig,
    seoConfig.description,
  ]);
  return (
    <>
      <SEO {...seoConfig} schemas={schemas} />
      <MDXPageRenderer content={Content} />
    </>
  );
};

export default CentersSetup;
