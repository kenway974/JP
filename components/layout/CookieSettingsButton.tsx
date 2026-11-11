'use client'

// Rouvre le bandeau cookies : retirer son consentement doit être aussi simple que le donner (CNIL)
export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event('open-cookie-banner'))}
      className="hover:text-white transition-colors hover:underline"
    >
      Gérer les cookies
    </button>
  )
}
