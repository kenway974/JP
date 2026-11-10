'use client'
import { useEffect, useState } from 'react'

// VERSION SALE — chaque « ❌ #n » renvoie à MAUVAISES-PRATIQUES.md
// Astuce tournage : ajouter ?sanspopup à l'URL pour masquer les popups et capturer le reste.

export function PopupsSale() {
  const [hidden, setHidden] = useState(false)
  const [newsletter, setNewsletter] = useState(false)
  const [cookies, setCookies] = useState(true)

  useEffect(() => {
    if (window.location.search.includes('sanspopup')) { setHidden(true); return }
    // ❌ #19 Popup newsletter qui s'ouvre dès l'arrivée, avant même de lire la page
    const t = setTimeout(() => setNewsletter(true), 800)
    return () => clearTimeout(t)
  }, [])

  if (hidden) return null

  return (
    <>
      {newsletter && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full p-6 relative text-center">
            {/* ❌ #20 Croix de fermeture minuscule et grise */}
            <button
              onClick={() => setNewsletter(false)}
              className="absolute top-1 right-1 text-[10px] text-gray-300"
              aria-label="Fermer"
            >
              x
            </button>
            <div className="text-4xl mb-2">📧🎁</div>
            <p className="text-xl font-bold text-purple-700 mb-2">NE PARTEZ PAS !!!</p>
            <p className="text-sm text-gray-500 mb-4">
              Inscrivez-vous à notre newsletter pour recevoir nos actualités, offres, conseils et bien plus encore !
            </p>
            <input className="border w-full px-2 py-2 mb-2 text-sm" placeholder="Votre email" />
            <label className="flex items-start gap-2 text-[10px] text-gray-400 text-left mb-3">
              <input type="checkbox" defaultChecked /> J&apos;accepte de recevoir les offres de MonChauff et de ses partenaires
            </label>
            <button className="bg-purple-600 text-white w-full py-2 font-bold">JE M&apos;INSCRIS</button>
            <button onClick={() => setNewsletter(false)} className="mt-2 text-[10px] text-gray-400 underline">
              Non merci, je n&apos;aime pas faire des économies
            </button>
          </div>
        </div>
      )}

      {cookies && (
        // ❌ #21 Bandeau cookies : seulement « Accepter » mis en avant, pas de « Refuser »
        <div className="fixed bottom-0 inset-x-0 z-40 bg-gray-900 text-white p-4 text-xs">
          <p className="mb-3">
            Ce site utilise des cookies pour améliorer votre expérience. En continuant votre navigation, vous acceptez
            l&apos;utilisation des cookies.
          </p>
          <div className="flex items-center gap-4">
            <button onClick={() => setCookies(false)} className="bg-green-500 text-white font-bold px-8 py-3">
              TOUT ACCEPTER
            </button>
            <button className="text-[10px] text-gray-500">paramétrer</button>
          </div>
        </div>
      )}

      {/* ❌ #22 Widget de chat qui recouvre le contenu et le bouton d'action */}
      <div className="fixed bottom-28 right-3 z-40 flex items-end gap-2">
        <div className="bg-white shadow-lg border text-sm p-3 max-w-[200px]">
          Bonjour 👋 Besoin d&apos;aide ? Un conseiller vous répond !
        </div>
        <div className="relative w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl shadow-lg">
          💬
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[11px] w-5 h-5 rounded-full flex items-center justify-center">
            3
          </span>
        </div>
      </div>
    </>
  )
}
