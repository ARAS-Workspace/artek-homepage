import React, { useMemo } from 'react';
import SEO from '@shared/components/content/SEO';
import Hero, { type HeroContent } from '@shared/components/ui/Hero';
import Services, { type ServicesContent } from '@shared/components/ui/Services';
import Faq, { type FaqContent } from '@shared/components/ui/Faq';
import { useLocale } from '@shared/hooks';
import { getSiteConfig } from '@shared/config/seoConfig';
import { createDefaultSiteSchemas } from '@shared/utils/schema-helpers';

// Section content - TR
import heroContentTr from './data/sections/tr/hero.json';
import servicesContentTr from './data/sections/tr/services.json';
import faqContentTr from './data/sections/tr/faq.json';

// Section content - EN
import heroContentEn from './data/sections/en/hero.json';
import servicesContentEn from './data/sections/en/services.json';
import faqContentEn from './data/sections/en/faq.json';

// Styles
import './styles/main.scss';

const HERO_CONTENT_MAP: Record<'tr' | 'en', HeroContent> = {
  tr: heroContentTr as HeroContent,
  en: heroContentEn as HeroContent,
};

const SERVICES_CONTENT_MAP: Record<'tr' | 'en', ServicesContent> = {
  tr: servicesContentTr as ServicesContent,
  en: servicesContentEn as ServicesContent,
};

const FAQ_CONTENT_MAP: Record<'tr' | 'en', FaqContent> = {
  tr: faqContentTr as FaqContent,
  en: faqContentEn as FaqContent,
};

const HomePage: React.FC = () => {
  const { locale } = useLocale();

  // Get site config for current locale
  const siteConfig = getSiteConfig(locale);

  // Get sections content for current locale
  const heroContent = useMemo(() => HERO_CONTENT_MAP[locale], [locale]);
  const servicesContent = useMemo(() => SERVICES_CONTENT_MAP[locale], [locale]);
  const faqContent = useMemo(() => FAQ_CONTENT_MAP[locale], [locale]);

  // Page schemas — Organization & LocalBusiness come from the explicit
  // createDefaultSiteSchemas call below (the SEO component adds nothing itself).
  const schemas = useMemo(() => {
    const baseUrl = siteConfig.url;

    // 1. VideoObject Schema (Hero video)
    const videoObjectSchema = {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      '@id': `${baseUrl}/#hero-video`,
      name: heroContent.title,
      description: heroContent.description,
      thumbnailUrl: heroContent.video.poster,
      contentUrl: heroContent.video.src,
      uploadDate: '2025-01-15T00:00:00Z',
      duration: 'PT9S', // 9 seconds
    };

    // 2. FAQPage Schema
    const faqPageSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqContent.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };

    return [...createDefaultSiteSchemas(locale), videoObjectSchema, faqPageSchema];
  }, [heroContent, faqContent, siteConfig, locale]);

  return (
    <>
      <SEO schemas={schemas} />
      <Hero content={heroContent} />
      <Services content={servicesContent} />
      <Faq content={faqContent} />
    </>
  );
};

export default HomePage;
