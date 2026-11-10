import Link from 'next/link'

// VERSION SALE — chaque « ❌ #n » renvoie à MAUVAISES-PRATIQUES.md

const NAV = [
  'Accueil', 'Qui sommes-nous ?', 'Nos services', 'Nos prestations', 'Nos valeurs',
  'Galerie', 'Actualités', 'Partenaires', 'FAQ', 'Liens utiles', 'Contact',
]

export function HeaderSale() {
  return (
    <header>
      {/* ❌ #1 Bandeau promo agressif qui clignote */}
      <div className="bg-red-600 text-yellow-300 text-center text-sm font-bold py-2 animate-pulse">
        🔥🔥🔥 PROMO EXCEPTIONNELLE -50% SUR TOUT !!! OFFRE LIMITÉE DANS LE TEMPS !!! 🔥🔥🔥
      </div>

      <div className="bg-white border-b-4 border-purple-600 px-3 py-4">
        {/* ❌ #2 Logo = texte en police fantaisie + slogan creux, aucun numéro de téléphone */}
        <div className="text-center">
          <div className="text-5xl text-purple-700" style={{ fontFamily: 'var(--font-anton), Impact, sans-serif' }}>
            MonChauff
          </div>
          <div className="text-xs text-gray-400 italic" style={{ fontFamily: 'var(--font-lobster), cursive' }}>
            L&apos;excellence au service de votre confort depuis toujours
          </div>
        </div>

        {/* ❌ #3 Menu à 11 entrées, pas de menu mobile, aucun bouton d'action */}
        <nav className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[13px] text-blue-700 underline">
          {NAV.map((item) => (
            <Link key={item} href={item === 'Contact' ? '/contact' : '/'}>
              {item}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
