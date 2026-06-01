import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CookieBanner } from '@/components/layout/CookieBanner'
import { LocalBusinessSchema } from '@/components/seo/SchemaOrg'
import { Toaster } from 'react-hot-toast'
import { COMPANY_NAME, COMPANY_LOCATION, COMPANY_SINCE, SITE_URL } from '@/lib/config'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-plus-jakarta', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${COMPANY_NAME} — Installation, Entretien & Dépannage en ${COMPANY_LOCATION}`,
    template: `%s | ${COMPANY_NAME}`,
  },
  description: `Chauffagiste en ${COMPANY_LOCATION} depuis ${COMPANY_SINCE}. Installation chaudière, pompe à chaleur, climatisation, VMC, plomberie. Devis gratuit en ligne. Disponible 24h/7j.`,
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
    description: `Chauffagiste en ${COMPANY_LOCATION} depuis ${COMPANY_SINCE}. Devis gratuit en ligne.`,
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: `${COMPANY_NAME} ${COMPANY_LOCATION}` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${COMPANY_NAME} — ${COMPANY_LOCATION}`,
    description: `Installation, entretien et dépannage en chauffage, climatisation et VMC en ${COMPANY_LOCATION}.`,
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
    <html lang="fr" className={`${inter.variable} ${plusJakarta.variable}`}>
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
        <Header />
        <main>{children}</main>
        <Footer />
        <CookieBanner />
        <Toaster position="bottom-right" toastOptions={{ style: { borderRadius: '12px', fontFamily: 'var(--font-inter)' } }} />
      </body>
    </html>
  )
}
