'use client'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { Gift, X, Loader2, CheckCircle } from 'lucide-react'
import { OFFERS } from '@/lib/newsletter/offers'

const STORAGE_KEY = 'lead-magnet'

// Stockage navigateur optionnel : si bloqué, la popup peut réapparaître, sans gravité
// Après une fermeture, la popup revient au plus tôt 5 minutes plus tard ; après un envoi, jamais.
const SNOOZE_MS = 5 * 60 * 1000

function isBlocked(): boolean {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (value === 'done') return true
    if (value?.startsWith('snooze:')) return Date.now() - Number(value.slice(7)) < SNOOZE_MS
  } catch { /* ignoré */ }
  return false
}
function markDone() {
  try { localStorage.setItem(STORAGE_KEY, 'done') } catch { /* ignoré */ }
}
function markSnoozed() {
  try {
    if (localStorage.getItem(STORAGE_KEY) !== 'done') localStorage.setItem(STORAGE_KEY, `snooze:${Date.now()}`)
  } catch { /* ignoré */ }
}

export function LeadMagnet() {
  const [open, setOpen] = useState(false)
  const [offerId, setOfferId] = useState(OFFERS[0].id)
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [website, setWebsite] = useState('') // champ piège
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  // Vrai tant que la popup est ouverte ou vient d'être fermée : empêche de la rouvrir à chaque scroll,
  // même si le stockage navigateur est bloqué.
  const lockedRef = useRef(false)

  useEffect(() => {
    let timer: number | undefined
    let armed = false

    // Apparaît après 20 secondes de lecture ou à 40 % de la page, jamais à l'arrivée
    const show = () => {
      if (lockedRef.current || isBlocked()) return
      lockedRef.current = true
      setOpen(true)
    }
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max > 0 && window.scrollY / max >= 0.4) show()
    }

    // Armé seulement une fois que le visiteur a répondu au bandeau cookies
    const arm = () => {
      if (armed) return
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
    markSnoozed()
    setOpen(false)
    // Réarmée après 5 minutes : la prochaine fois qu'il fait défiler la page, elle peut revenir.
    window.setTimeout(() => { lockedRef.current = false }, SNOOZE_MS)
  }

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

  if (!open) return null

  const offer = OFFERS.find((o) => o.id === offerId) ?? OFFERS[0]

  return (
    <div
      role="dialog"
      aria-labelledby="lead-magnet-title"
      className="fixed bottom-4 left-4 right-4 z-40 md:left-6 md:right-auto md:w-[400px] animate-slide-up"
    >
      <div className="rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-brand-orange">
            <Gift className="h-5 w-5" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wide">Guide offert</span>
          </div>
          <button onClick={close} aria-label="Fermer" className="-m-1 p-1 text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {status === 'sent' ? (
          <div className="py-6 text-center">
            <CheckCircle className="mx-auto mb-3 h-10 w-10 text-green-600" aria-hidden="true" />
            <p id="lead-magnet-title" className="font-heading font-bold text-brand-navy">C&apos;est parti !</p>
            <p className="mt-1 text-sm text-slate-600">Le guide arrive dans votre boîte mail dans quelques instants.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-2 space-y-4">
            <h2 id="lead-magnet-title" className="font-heading font-bold text-brand-navy text-lg leading-snug">
              Lequel vous aide le plus ?
            </h2>

            <div className="grid gap-2" role="group" aria-label="Choix du guide">
              {OFFERS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  aria-pressed={o.id === offerId}
                  onClick={() => setOfferId(o.id)}
                  className={`rounded-xl border-2 px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                    o.id === offerId
                      ? 'border-brand-orange bg-orange-50 text-brand-navy'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <p className="text-sm text-slate-600">{offer.teaser}</p>

            <div>
              <label htmlFor="lead-email" className="mb-1 block text-sm font-medium text-slate-700">Votre email</label>
              <input
                id="lead-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prenom@exemple.fr"
                className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
              />
            </div>

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

            <label className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-600">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-brand-orange"
              />
              <span>
                J&apos;accepte de recevoir ce guide par email. Je ne recevrai pas d&apos;autre email sans l&apos;avoir demandé.
                Voir la{' '}
                <Link href="/confidentialite" className="underline hover:text-brand-orange">politique de confidentialité</Link>.
              </span>
            </label>

            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-orange py-3 font-semibold text-white shadow-md shadow-orange-500/25 hover:bg-brand-orange-dark transition-colors disabled:opacity-70"
            >
              {status === 'loading' && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Recevoir le guide
            </button>
            <button type="button" onClick={close} className="w-full text-center text-xs text-slate-500 underline underline-offset-2 hover:text-slate-700">
              Plus tard
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
