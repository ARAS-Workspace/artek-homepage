import type { SiteConfig } from '@shared/config/seoConfig';

export interface ServiceOffer {
  name: { tr: string; en: string };
  description: { tr: string; en: string };
}

export const CONSULTANCY_SERVICE_OFFERS: ServiceOffer[] = [
  {
    name: {
      tr: 'Merkez Kurulum Danışmanlığı',
      en: 'Center Setup Consultancy',
    },
    description: {
      tr: '5746 sayılı Kanun kapsamında Ar-Ge ve Tasarım Merkezi kurulum sürecinde profesyonel danışmanlık. Stratejik analiz, organizasyonel tasarım, başvuru hazırlığı ve operasyonel başlatma desteği.',
      en: 'Professional consultancy for R&D and Design Center establishment under Law No. 5746. Strategic analysis, organizational design, application preparation, and operational launch support.',
    },
  },
  {
    name: {
      tr: 'Proje Danışmanlığı',
      en: 'Project Consultancy',
    },
    description: {
      tr: 'TÜBİTAK, KOSGEB, Kalkınma Ajansları ve uluslararası fonlar için proje hazırlama, başvuru ve yönetim danışmanlığı. Teknik fizibilite, proje yazımı ve hibe süreçlerinde mühendislik odaklı rehberlik.',
      en: 'Project preparation, application, and management consultancy for TÜBİTAK, KOSGEB, Development Agencies, and international funds. Engineering-focused guidance in technical feasibility, project writing, and grant processes.',
    },
  },
  {
    name: {
      tr: 'Teknik Eğitim',
      en: 'Technical Education',
    },
    description: {
      tr: 'Sanayi işletmeniz için teknik eğitim ve gelişim programları. Yetkinlik haritalaması, teknik programlar, mentörlük desteği ve sürekli gelişim takibi.',
      en: 'Technical education and development programs for your industrial enterprise. Competency mapping, technical programs, mentorship support, and continuous development tracking.',
    },
  },
  {
    name: {
      tr: 'İstatistik & Veri Analizi',
      en: 'Statistics & Data Analysis',
    },
    description: {
      tr: 'Ar-Ge ve Tasarım merkezlerinin güncel istatistikleri, sektörel ve bölgesel dağılımları, personel sayıları ve merkez listesi. Detaylı analiz ve veri görselleştirme.',
      en: 'Current statistics of R&D and Design centers, sectoral and regional distributions, personnel numbers, and center listings. Detailed analysis and data visualization.',
    },
  },
];

export const CONSULTANCY_KNOWS_ABOUT = {
  tr: [
    'Merkez Kurulum Danışmanlığı',
    'Proje Danışmanlığı',
    'Teknik Eğitim',
    'İstatistik & Veri Analizi',
  ],
  en: [
    'Center Setup Consultancy',
    'Project Consultancy',
    'Technical Education',
    'Statistics & Data Analysis',
  ],
};

export interface ProfessionalServiceOptions {
  offers?: ServiceOffer[];
  knowsAbout?: { tr: string[]; en: string[] };
}

export const createProfessionalServiceSchema = (
  siteConfig: SiteConfig,
  locale: 'tr' | 'en',
  options: ProfessionalServiceOptions = {}
) => {
  const { offers = CONSULTANCY_SERVICE_OFFERS, knowsAbout = CONSULTANCY_KNOWS_ABOUT } = options;

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${siteConfig.url}/#professionalservice`,
    name: siteConfig.title,
    description: siteConfig.description,
    url: `${siteConfig.url}/services/consultancy`,
    logo: `${siteConfig.url}${siteConfig.logo}`,
    image: `${siteConfig.url}${siteConfig.defaultImage}`,
    telephone: siteConfig.localBusiness.telephone,
    email: siteConfig.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: siteConfig.localBusiness.address.city,
      addressRegion: siteConfig.localBusiness.address.city,
      streetAddress: siteConfig.localBusiness.address.street,
      postalCode: siteConfig.localBusiness.address.postalCode,
      addressCountry: siteConfig.localBusiness.address.country,
    },
    areaServed: {
      '@type': 'Country',
      name: locale === 'tr' ? 'Türkiye' : 'Turkey',
    },
    knowsAbout: knowsAbout[locale],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: locale === 'tr' ? 'Danışmanlık Hizmetleri' : 'Consultancy Services',
      itemListElement: offers.map((offer) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: offer.name[locale],
          description: offer.description[locale],
        },
      })),
    },
    priceRange: siteConfig.localBusiness.priceRange,
    currenciesAccepted: 'TRY, USD, EUR',
    paymentAccepted: locale === 'tr' ? 'Banka Havalesi' : 'Bank Transfer',
  };
};
