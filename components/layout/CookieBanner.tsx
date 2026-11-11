'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, ShieldCheck } from 'lucide-react'

type Consent = 'accepted' | 'declined'

function setGtagConsent(value: Consent) {
  const w = window as unknown as { gtag?: (...args: unknown[]) => void }
  w.gtag?.('consent', 'update', { analytics_storage: value === 'accepted' ? 'granted' : 'denied' })
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem('cookie-consent')) setVisible(true)
    } catch {
      // Stockage bloqué (navigation privée) : le bandeau reste affiché
      setVisible(true)
    }
  }, [])

  const choose = (value: Consent) => {
    try {
      localStorage.setItem('cookie-consent', value)
    } catch {
      // Sans stockage, le choix vaut pour la visite en cours seulement
    }
    setGtagConsent(value)
    setVisible(false)
    // Prévient la popup newsletter qu'elle peut s'armer
    window.dispatchEvent(new Event('cookie-consent-changed'))
  }

  if (!visible) return null

  return (
    <div role="dialog" aria-labelledby="cookie-title" className="fixed inset-x-0 bottom-0 z-50 p-4 md:p-6 animate-slide-up">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5 p-5 md:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-orange-50">
            <Cookie className="h-6 w-6 text-brand-orange" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h2 id="cookie-title" className="font-heading font-bold text-brand-navy text-base mb-1">
              Un site rapide, et vos choix comptent
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Nous mesurons l&apos;audience de ce site (Google Analytics) pour savoir quelles informations vous aident
              le plus. Refuser n&apos;empêche rien : le site fonctionne de la même façon.
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-green-600" aria-hidden="true" />
              Vos données ne sont jamais vendues.{' '}
              <Link href="/confidentialite" className="underline underline-offset-2 hover:text-brand-orange">
                En savoir plus
              </Link>
            </p>
          </div>
        </div>

        {/* Même taille, même poids visuel : refuser est aussi simple qu'accepter */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={() => choose('declined')}
            className="rounded-xl border-2 border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Refuser
          </button>
          <button
            onClick={() => choose('accepted')}
            className="rounded-xl bg-brand-orange py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/25 hover:bg-brand-orange-dark transition-colors"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  )
}
