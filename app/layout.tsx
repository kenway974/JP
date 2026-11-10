import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans, Comic_Neue, Anton, Lobster } from 'next/font/google'
import { HeaderSale } from '@/components/sale/HeaderSale'
import { FooterSale } from '@/components/sale/FooterSale'
import { PopupsSale } from '@/components/sale/PopupsSale'
import { LocalBusinessSchema } from '@/components/seo/SchemaOrg'
import { Toaster } from 'react-hot-toast'
import { COMPANY_NAME, COMPANY_LOCATION, COMPANY_SINCE, SITE_URL, COMPANY_LOCATION_IN } from '@/lib/config'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-plus-jakarta', display: 'swap' })
// VERSION SALE — ❌ trop de polices fantaisie mélangées
const comic = Comic_Neue({ subsets: ['latin'], weight: '700', variable: '--font-comic', display: 'swap' })
const anton = Anton({ subsets: ['latin'], weight: '400', variable: '--font-anton', display: 'swap' })
const lobster = Lobster({ subsets: ['latin'], weight: '400', variable: '--font-lobster', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    // VERSION SALE — ❌ titre d'onglet par défaut sans métier ni ville
    default: 'Mon site',
    template: '%s',
  },
  description: `Chauffagiste ${COMPANY_LOCATION_IN} depuis ${COMPANY_SINCE}. Installation chaudière, pompe à chaleur, climatisation, VMC, plomberie. Devis gratuit en ligne. Disponible 24h/7j.`,
  keywords: [
    `chauffagiste ${COMPANY_LOCATION.toLowerCase()}`, 'installation chaudière', 'pompe à chaleur',
    'climatisation réversible', 'entretien chaudière', 'dépannage chauffage urgence',
    'VMC installation', 'plombier chauffagiste', 'génie climatique',
    'installation PAC', 'plancher chauffant', 'remplacement chaudière gaz',
  ],
  authors: [{ name: COMPANY_NAME }],
  creator: COMPANY_NAME,
  publisher: COMPANY_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: SITE_URL,
    siteName: COMPANY_NAME,
    title: `${COMPANY_NAME} — ${COMPANY_LOCATION}`,
    description: `Chauffagiste ${COMPANY_LOCATION_IN} depuis ${COMPANY_SINCE}. Devis gratuit en ligne.`,
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: `${COMPANY_NAME} ${COMPANY_LOCATION}` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${COMPANY_NAME} — ${COMPANY_LOCATION}`,
    description: `Installation, entretien et dépannage en chauffage, climatisation et VMC ${COMPANY_LOCATION_IN}.`,
    images: ['/images/og-image.jpg'],
  },
  alternates: { canonical: SITE_URL },
  verification: { google: 'ADD_GOOGLE_SEARCH_CONSOLE_TOKEN_HERE' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1a2744',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  return (
    <html lang="fr" className={`${inter.variable} ${plusJakarta.variable} ${comic.variable} ${anton.variable} ${lobster.variable}`}>
      <head>
        <LocalBusinessSchema />
        {gaId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('consent', 'default', { analytics_storage: 'denied' });
                  gtag('config', '${gaId}', { page_path: window.location.pathname });
                `,
              }}
            />
          </>
        )}
      </head>
      <body>
        <HeaderSale />
        <main>{children}</main>
        <FooterSale />
        <PopupsSale />
        <Toaster position="bottom-right" toastOptions={{ style: { borderRadius: '12px', fontFamily: 'var(--font-inter)' } }} />
      </body>
    </html>
  )
}
