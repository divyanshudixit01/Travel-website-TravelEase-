/**
 * schemas.js — Centralized Schema.org factory functions for TravelEase.
 * 
 * All functions return plain objects ready for JSON-LD serialization.
 * Use with the <JsonLd> component to inject into pages.
 */

const SITE_URL = 'https://www.travelease.com';
const SITE_NAME = 'TravelEase';
const LOGO_URL = `${SITE_URL}/brand/logo-mark.svg`;

// ─── Organization ────────────────────────────────────────────────
export const getOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: LOGO_URL,
    width: 512,
    height: 512,
  },
  description:
    'TravelEase is the world\'s smartest travel platform. AI-powered trip planning, real-time flight & hotel deals, and curated experiences. Trusted by 5M+ travelers worldwide.',
  foundingDate: '2026',
  founder: {
    '@type': 'Person',
    name: 'Divyanshu Dixit',
    jobTitle: 'Founder & CEO',
  },
  numberOfEmployees: {
    '@type': 'QuantitativeValue',
    value: 50,
  },
  sameAs: [
    'https://www.facebook.com/travelease',
    'https://twitter.com/travelease',
    'https://www.instagram.com/travelease',
    'https://www.linkedin.com/company/travelease',
    'https://www.youtube.com/travelease',
  ],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: '+1-800-123-4567',
      contactType: 'sales',
      availableLanguage: ['English'],
    },
    {
      '@type': 'ContactPoint',
      email: 'support@travelease.com',
      contactType: 'customer support',
      availableLanguage: ['English'],
    },
  ],
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'One World Trade Center, Suite 4500',
    addressLocality: 'New York',
    addressRegion: 'NY',
    postalCode: '10007',
    addressCountry: 'US',
  },
});

// ─── WebSite + SearchAction ──────────────────────────────────────
export const getWebSiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  publisher: { '@id': `${SITE_URL}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/destinations?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
});

// ─── WebPage ─────────────────────────────────────────────────────
export const getWebPageSchema = ({ type = 'WebPage', name, description, url, breadcrumb }) => ({
  '@context': 'https://schema.org',
  '@type': type,
  '@id': `${SITE_URL}${url}#webpage`,
  name,
  description,
  url: `${SITE_URL}${url}`,
  isPartOf: { '@id': `${SITE_URL}/#website` },
  about: { '@id': `${SITE_URL}/#organization` },
  ...(breadcrumb ? { breadcrumb: { '@id': `${SITE_URL}${url}#breadcrumb` } } : {}),
});

// ─── BreadcrumbList ──────────────────────────────────────────────
export const getBreadcrumbSchema = (items, pageUrl) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  '@id': `${SITE_URL}${pageUrl}#breadcrumb`,
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url ? `${SITE_URL}${item.url}` : undefined,
  })),
});

// ─── Article / BlogPosting ───────────────────────────────────────
export const getArticleSchema = ({ title, author, datePublished, image, excerpt, url }) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: title,
  author: {
    '@type': 'Person',
    name: author,
  },
  datePublished,
  dateModified: datePublished,
  image,
  description: excerpt,
  url: `${SITE_URL}${url}`,
  publisher: { '@id': `${SITE_URL}/#organization` },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${SITE_URL}${url}`,
  },
});

// ─── Service ─────────────────────────────────────────────────────
export const getServiceSchema = ({ name, description, url, serviceType, areaServed = 'Worldwide' }) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${SITE_URL}${url}#service`,
  name,
  description,
  url: `${SITE_URL}${url}`,
  serviceType,
  provider: { '@id': `${SITE_URL}/#organization` },
  areaServed,
  availableChannel: {
    '@type': 'ServiceChannel',
    serviceUrl: `${SITE_URL}${url}`,
    serviceSmsNumber: '+1-800-123-4567',
  },
});

// ─── Product / Offer (for flights, hotels, tours) ────────────────
export const getProductSchema = ({ name, description, image, price, currency = 'USD', url, rating, reviewCount, availability = 'InStock', category }) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name,
  description,
  image,
  url: `${SITE_URL}${url}`,
  category,
  brand: { '@id': `${SITE_URL}/#organization` },
  offers: {
    '@type': 'Offer',
    price,
    priceCurrency: currency,
    availability: `https://schema.org/${availability}`,
    seller: { '@id': `${SITE_URL}/#organization` },
    url: `${SITE_URL}${url}`,
  },
  ...(rating ? {
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating,
      reviewCount: reviewCount || 100,
      bestRating: 5,
      worstRating: 1,
    },
  } : {}),
});

// ─── LodgingBusiness (Hotels) ────────────────────────────────────
export const getLodgingBusinessSchema = ({ name, description, image, address, city, country, rating, reviewCount, priceRange, amenities, starRating }) => ({
  '@context': 'https://schema.org',
  '@type': 'LodgingBusiness',
  name,
  description: description || `${starRating}-star hotel in ${city}, ${country}`,
  image,
  address: {
    '@type': 'PostalAddress',
    streetAddress: address,
    addressLocality: city,
    addressCountry: country,
  },
  starRating: {
    '@type': 'Rating',
    ratingValue: starRating,
  },
  ...(amenities ? { amenityFeature: amenities.map(a => ({ '@type': 'LocationFeatureSpecification', name: a, value: true })) } : {}),
  priceRange: priceRange || '$$',
  ...(rating ? {
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating,
      reviewCount: reviewCount || 100,
      bestRating: 5,
      worstRating: 1,
    },
  } : {}),
});

// ─── TouristTrip ─────────────────────────────────────────────────
export const getTouristTripSchema = ({ name, description, image, location, price, currency = 'USD', rating, reviewCount, duration }) => ({
  '@context': 'https://schema.org',
  '@type': 'TouristTrip',
  name,
  description,
  image,
  touristType: 'Leisure',
  itinerary: {
    '@type': 'ItemList',
    description: `${duration} experience in ${location}`,
    numberOfItems: 1,
  },
  offers: {
    '@type': 'Offer',
    price,
    priceCurrency: currency,
    availability: 'https://schema.org/InStock',
    seller: { '@id': `${SITE_URL}/#organization` },
  },
  ...(rating ? {
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating,
      reviewCount: reviewCount || 50,
      bestRating: 5,
      worstRating: 1,
    },
  } : {}),
});

// ─── FAQPage ─────────────────────────────────────────────────────
export const getFAQSchema = (questions) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: questions.map(q => ({
    '@type': 'Question',
    name: q.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: q.answer,
    },
  })),
});

// ─── LocalBusiness ───────────────────────────────────────────────
export const getLocalBusinessSchema = ({ name, streetAddress, city, region, postalCode, country, telephone, email }) => ({
  '@context': 'https://schema.org',
  '@type': 'TravelAgency',
  name,
  address: {
    '@type': 'PostalAddress',
    streetAddress,
    addressLocality: city,
    addressRegion: region,
    postalCode,
    addressCountry: country,
  },
  ...(telephone ? { telephone } : {}),
  ...(email ? { email } : {}),
  url: SITE_URL,
  parentOrganization: { '@id': `${SITE_URL}/#organization` },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '09:00',
    closes: '18:00',
  },
});

// ─── Person (Team members) ───────────────────────────────────────
export const getPersonSchema = ({ name, jobTitle, image, description }) => ({
  '@type': 'Person',
  name,
  jobTitle,
  image,
  description,
  worksFor: { '@id': `${SITE_URL}/#organization` },
});

// ─── ItemList (for collections of destinations/products) ─────────
export const getItemListSchema = ({ name, description, url, items }) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name,
  description,
  url: `${SITE_URL}${url}`,
  numberOfItems: items.length,
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    url: item.url ? `${SITE_URL}${item.url}` : undefined,
    ...(item.image ? { image: item.image } : {}),
  })),
});

// ─── SoftwareApplication (AI Trip Planner) ───────────────────────
export const getSoftwareApplicationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'TravelEase Custom Itinerary Planner',
  applicationCategory: 'TravelApplication',
  operatingSystem: 'Web',
  description: 'Custom travel planning tool that instantly compiles verified multi-modal itineraries combining trains, flights, stays, and experiences in Indian Rupees (₹).',
  url: `${SITE_URL}/itinerary`,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  provider: { '@id': `${SITE_URL}/#organization` },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '128000',
    bestRating: '5',
    worstRating: '1',
  },
});

// ─── AggregateRating (standalone for platform) ───────────────────
export const getPlatformRatingSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'TravelAgency',
  '@id': `${SITE_URL}/#travelagency`,
  name: SITE_NAME,
  url: SITE_URL,
  image: LOGO_URL,
  description: 'AI-powered travel platform for flights, hotels, and experiences across 190+ countries.',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '128000',
    bestRating: '5',
    worstRating: '1',
  },
});
