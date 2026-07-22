import React, { lazy, Suspense, useMemo } from 'react';
import SEO from '@shared/components/content/SEO';
import { Grid, Column, SkeletonPlaceholder } from '@carbon/react';
import { Email, Phone, Location } from '@carbon/icons-react';
import { useLocale, useIsClient } from '@shared/hooks';
import { translate } from '@shared/translations';
import { createDefaultSiteSchemas, createWebSiteRef } from '@shared/utils/schema-helpers';
import { getSiteConfig } from '@shared/config/seoConfig';

// SEO configurations
import seoConfigTr from './data/seo/tr/data.json';
import seoConfigEn from './data/seo/en/data.json';

// Components
import { ContactForm } from './_components/ContactForm';

// Styles
import './styles/main.scss';

// Lazy load Google Map for performance
const GoogleMapComponent = lazy(() => import('@shared/components/ui/GoogleMap'));

// Content maps
const SEO_MAP = {
  tr: seoConfigTr,
  en: seoConfigEn,
};

const ContactPage: React.FC = () => {
  const isClient = useIsClient(); // Pre-rendering aware hook

  const { locale } = useLocale();
  const t = translate(locale);

  // SEO configuration
  const seoConfig = useMemo(
    () => ({
      ...(SEO_MAP[locale] || SEO_MAP.tr),
    }),
    [locale]
  );

  const schemas = useMemo(() => {
    const siteConfig = getSiteConfig(locale);
    const webPageSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: seoConfig.title,
      description: seoConfig.description,
      url: siteConfig.href,
      isPartOf: createWebSiteRef(locale),
      about: {
        '@type': 'Thing',
        name: locale === 'tr' ? 'İletişim' : 'Contact',
      },
    };
    return [...createDefaultSiteSchemas(locale), webPageSchema];
  }, [locale, seoConfig.title, seoConfig.description]);

  return (
    <>
      <SEO {...seoConfig} schemas={schemas} />
      <section className="contact-page">
        <Grid className="contact_page">
          <Column lg={16} md={8} sm={4}>
            <h1>{t.contactPage.title}</h1>
            <p className="lead">{t.contactPage.lead}</p>
          </Column>

          <Column lg={16} md={8} sm={4}>
            <div className="map-container">
              {/* Skip GoogleMap during pre-rendering */}
              {isClient ? (
                <Suspense
                  fallback={
                    <div style={{ height: '450px', borderRadius: '4px', overflow: 'hidden' }}>
                      <SkeletonPlaceholder style={{ width: '100%', height: '100%' }} />
                    </div>
                  }
                >
                  <GoogleMapComponent
                    lat={39.4414677}
                    lng={29.9819526}
                    zoom={13}
                    title="ARTEK"
                    companyName="ARTEK"
                    address="Çalca Osb Mah. 1 Cad. <br /> No:1/3 İç Kapı:218 <br /> Merkez - Kütahya / Türkiye"
                    getDirectionsButtonText={t.contactPage.getDirections}
                  />
                </Suspense>
              ) : (
                <div
                  style={{
                    height: '450px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                  }}
                >
                  {t.contactPage.mapLoading}
                </div>
              )}
            </div>
          </Column>

          <Column lg={10} md={8} sm={4}>
            {isClient ? (
              <ContactForm locale={locale} translations={t.contactPage} />
            ) : (
              <div className="contact-form">
                <h2>{t.contactPage.form.title}</h2>
                <div style={{ minHeight: '400px' }}>
                  <SkeletonPlaceholder
                    style={{ width: '100%', height: '56px', marginBottom: '1rem' }}
                  />
                  <SkeletonPlaceholder
                    style={{ width: '100%', height: '56px', marginBottom: '1rem' }}
                  />
                  <SkeletonPlaceholder
                    style={{ width: '100%', height: '56px', marginBottom: '1rem' }}
                  />
                  <SkeletonPlaceholder
                    style={{ width: '100%', height: '56px', marginBottom: '1rem' }}
                  />
                  <SkeletonPlaceholder
                    style={{ width: '100%', height: '56px', marginBottom: '1rem' }}
                  />
                  <SkeletonPlaceholder
                    style={{ width: '100%', height: '120px', marginBottom: '1rem' }}
                  />
                </div>
              </div>
            )}
          </Column>

          <Column lg={6} md={8} sm={4}>
            <div className="contact-info">
              <h3>{t.contactPage.info.title}</h3>

              <div className="info-item">
                <Phone size={20} />
                <div>
                  <span className="label">{t.contactPage.info.phone}</span>
                  <span className="value">+90 (274) 606 0457</span>
                </div>
              </div>

              <div className="info-item">
                <Email size={20} />
                <div>
                  <span className="label">{t.contactPage.info.email}</span>
                  <span className="value">info@artek.tc</span>
                </div>
              </div>

              <div className="info-item">
                <Location size={20} />
                <div>
                  <span className="label">{t.contactPage.info.address}</span>
                  <span className="value">
                    Artek İnovasyon Arge San. ve Tic. Ltd. Şti. <br />
                    Çalca Osb Mah. 1 Cad. <br />
                    No:1/3 İç Kapı:218 <br />
                    Merkez - Kütahya / Türkiye
                  </span>
                </div>
              </div>

              <div className="working-hours">
                <h4>{t.contactPage.workingHours.title}</h4>
                <p>{t.contactPage.workingHours.weekdays}</p>
                <p>{t.contactPage.workingHours.saturday}</p>
                <p>{t.contactPage.workingHours.sunday}</p>
              </div>
            </div>
          </Column>
        </Grid>
      </section>
    </>
  );
};

export default ContactPage;
