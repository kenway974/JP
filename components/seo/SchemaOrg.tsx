import { COMPANY_NAME, COMPANY_PHONE_RAW, COMPANY_EMAIL, COMPANY_LOCATION, SITE_URL } from '@/lib/config'

export function LocalBusinessSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#organization`,
    name: COMPANY_NAME,
    description: `Chauffagiste en ${COMPANY_LOCATION}. Installation, entretien et dépannage de chaudières, pompes à chaleur, climatisation, VMC, plomberie et électricité.`,
    url: SITE_URL,
    telephone: `+33${COMPANY_PHONE_RAW.replace(/^0/, '')}`,
    email: COMPANY_EMAIL,
    address: {
      '@type': 'PostalAddress',
      addressRegion: COMPANY_LOCATION,
      addressCountry: 'FR',
    },
    geo: {
      '@type': 'GeoCircle',
      geoMidpoint: { '@type': 'GeoCoordinates', latitude: 48.8566, longitude: 2.3522 },
      geoRadius: '80000',
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: COMPANY_LOCATION,
    },
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '00:00', closes: '23:59' },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `Services ${COMPANY_NAME}`,
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: `Installation chaudière ${COMPANY_LOCATION}` } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: `Installation pompe à chaleur ${COMPANY_LOCATION}` } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: `Installation climatisation ${COMPANY_LOCATION}` } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: `Entretien chaudière ${COMPANY_LOCATION}` } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: `Dépannage chauffage urgence ${COMPANY_LOCATION}` } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: `Installation VMC ${COMPANY_LOCATION}` } },
      ],
    },
    foundingDate: '2024',
    knowsAbout: ['Chauffage', 'Climatisation', 'VMC', 'Plomberie', 'Électricité', 'Pompe à chaleur', 'Chaudière gaz', 'Entretien'],
    priceRange: '€€',
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function FAQSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function BlogPostSchema({ post }: {
  post: { title: string; excerpt: string; publishedAt: Date | null; slug: string; category: string }
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt?.toISOString(),
    author: {
      '@type': 'Organization',
      name: COMPANY_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: COMPANY_NAME,
    },
    url: `${SITE_URL}/blog/${post.slug}`,
    articleSection: post.category,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
