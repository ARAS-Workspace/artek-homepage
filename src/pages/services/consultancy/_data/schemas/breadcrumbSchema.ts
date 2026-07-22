import type { SiteConfig } from '@shared/config/seoConfig';

export interface BreadcrumbItem {
  name: { tr: string; en: string };
  path: string;
}

// Only routable paths belong here: '/services' is not a real route (it would
// land on the error page), so the trail goes straight from home to consultancy.
export const CONSULTANCY_BREADCRUMB_BASE: BreadcrumbItem[] = [
  { name: { tr: 'Ana Sayfa', en: 'Home' }, path: '/' },
  { name: { tr: 'Danışmanlık', en: 'Consultancy' }, path: '/services/consultancy' },
];

export const createBreadcrumbSchema = (
  siteConfig: SiteConfig,
  locale: 'tr' | 'en',
  additionalItems: BreadcrumbItem[] = []
) => {
  const allItems = [...CONSULTANCY_BREADCRUMB_BASE, ...additionalItems];

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name[locale],
      item: `${siteConfig.url}${item.path}`,
    })),
  };
};
