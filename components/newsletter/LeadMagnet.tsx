'use client'
import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Gift, X, Loader2, CheckCircle, Check } from 'lucide-react'
import { OFFERS } from '@/lib/newsletter/offers'

const STORAGE_KEY = 'lead-magnet'          // fermée ou envoyée : plus jamais
const SESSION_KEY = 'lead-magnet-shown'    // déjà affichée pendant cette visite

// Blog uniquement : le lecteur cherche un conseil, un guide lui est utile.
// Jamais sur l'accueil, ni pendant une estimation, un contact ou une prise de rendez-vous.
const ALLOWED_PATHS = [/^\/blog(\/.*)?$/]
function isAllowedPath(path: string | null): boolean {
  return !!path && ALLOWED_PATHS.some((r) => r.test(path))
}

// Stockage navigateur optionnel : si bloqué, la popup peut réapparaître, sans gravité
function isDone(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === 'done' } catch { return false }
}
function markDone() {
  try { localStorage.setItem(STORAGE_KEY, 'done') } catch { /* ignoré */ }
}
function shownThisSession(): boolean {
  try { return sessionStorage.getItem(SESSION_KEY) === '1' } catch { return false }
}
function markShownThisSession() {
  try { sessionStorage.setItem(SESSION_KEY, '1') } catch { /* ignoré */ }
}

export function LeadMagnet() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [offerId, setOfferId] = useState(OFFERS[0].id)
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [website, setWebsite] = useState('') // champ piège
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let timer: number | undefined
    let armed = false

    // Une seule ouverture par visite : on désarme dès l'affichage, et jamais après fermeture ou envoi
    const disarm = () => {
      window.clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
    }
    const show = () => {
      if (isDone() || shownThisSession()) return disarm()
      if (!isAllowedPath(window.location.pathname)) return
      disarm()
      markShownThisSession()
      setOpen(true)
    }

    // Apparaît après 20 secondes de lecture ou à 40 % de la page, jamais à l'arrivée
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max > 0 && window.scrollY / max >= 0.4) show()
    }

    // Armé seulement une fois que le visiteur a répondu au bandeau cookies
    const arm = () => {
      if (armed || isDone() || shownThisSession()) return
      let answered = false
      try { answered = !!localStorage.getItem('cookie-consent') } catch { answered = false }
      if (!answered) return
      armed = true
      timer = window.setTimeout(show, 20000)
      window.addEventListener('scroll', onScroll, { passive: true })
    }

    window.addEventListener('cookie-consent-changed', arm)
    arm()
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('cookie-consent-changed', arm)
    }
  }, [])

  const close = () => {
    markDone()
    setOpen(false)
  }

  // Échap ferme la popup
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!consent) {
      setError('Cochez la case pour recevoir le guide.')
      return
    }
    setStatus('loading')
    setError(null)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, offer: offerId, consent: true, website }),
      })
      if (!res.ok) throw new Error('request failed')
      setStatus('sent')
      markDone()
    } catch {
      setStatus('error')
      setError("Impossible d'envoyer le guide pour le moment. Réessayez dans quelques minutes.")
    }
  }

  // Ne s'affiche jamais en dehors des pages de contenu, même après une navigation
  if (!open || !isAllowedPath(pathname)) return null

  const offer = OFFERS.find((o) => o.id === offerId) ?? OFFERS[0]

  return (
    <div
      role="dialog"
      aria-labelledby="lead-magnet-title"
      className="fixed bottom-4 left-4 right-4 z-[60] max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-900/10 md:left-6 md:right-auto md:w-[380px] animate-slide-up"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-brand-orange">
          <Gift className="h-3.5 w-3.5" aria-hidden="true" />
          Guide gratuit
        </span>
        <button onClick={close} aria-label="Fermer" className="-m-1 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {status === 'sent' ? (
        <div className="py-6 text-center">
          <CheckCircle className="mx-auto mb-3 h-10 w-10 text-green-600" aria-hidden="true" />
          <p id="lead-magnet-title" className="font-heading font-bold text-brand-navy">C&apos;est parti !</p>
          <p className="mt-1 text-sm text-slate-600">« {offer.title} » arrive dans votre boîte mail.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-3">
          {/* Choix du sujet */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Choix du guide">
            {OFFERS.map((o) => (
              <button
                key={o.id}
                type="button"
                aria-pressed={o.id === offerId}
                onClick={() => setOfferId(o.id)}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                  o.id === offerId
                    ? 'border-brand-orange bg-brand-orange text-white'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>

          {/* L'apport de valeur : ce que le visiteur reçoit, concrètement */}
          <h2 id="lead-magnet-title" className="mt-4 font-heading text-lg font-bold leading-snug text-brand-navy">
            {offer.title}
          </h2>
          <p className="mt-1 text-xs text-slate-500">Gratuit · envoyé tout de suite par email</p>
          <ul className="mt-3 space-y-1.5">
            {offer.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2 text-sm text-slate-700">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" aria-hidden="true" />
                {h}
              </li>
            ))}
          </ul>

          <label htmlFor="lead-email" className="sr-only">Votre email</label>
          <input
            id="lead-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre email"
            className="mt-4 w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
          />

          {/* Champ piège : invisible pour les humains */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="absolute -left-[9999px] h-0 w-0 opacity-0"
          />

          <label className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 flex-shrink-0 accent-brand-orange"
            />
            <span>
              J&apos;accepte de recevoir ce guide par email, sans autre envoi sans mon accord.{' '}
              <Link href="/confidentialite" className="underline hover:text-brand-orange">Confidentialité</Link>
            </span>
          </label>

          {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-orange py-3 font-semibold text-white shadow-md shadow-orange-500/25 transition-colors hover:bg-brand-orange-dark disabled:opacity-70"
          >
            {status === 'loading' && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Recevoir le guide gratuit
          </button>
          <button type="button" onClick={close} className="mt-2 w-full text-center text-xs text-slate-500 underline underline-offset-2 hover:text-slate-700">
            Plus tard
          </button>
        </form>
      )}
    </div>
  )
}
