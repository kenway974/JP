'use client'
import { OPEN_COOKIE_BANNER_EVENT } from '@/lib/consent'

// Rouvre le bandeau cookies : retirer son consentement doit être aussi simple que le donner (CNIL)
export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_BANNER_EVENT))}
      className="hover:text-white transition-colors hover:underline"
    >
      Gérer les cookies
    </button>
  )
}
