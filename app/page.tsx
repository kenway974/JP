import type { Metadata } from 'next'
import Link from 'next/link'

// VERSION SALE — page d'accueil « générée par un prompt vite fait ».
// Chaque « ❌ #n » renvoie à MAUVAISES-PRATIQUES.md.

// ❌ #4 Titre d'onglet « Home » : visible dans l'onglet et dans Google
export const metadata: Metadata = {
  title: { absolute: 'Home' },
}

const SERVICES = [
  { e: '🔥', t: 'Chauffage', d: 'Nous proposons des solutions de chauffage innovantes adaptées à vos besoins.' },
  { e: '❄️', t: 'Climatisation', d: 'Systèmes VRV/VRF, split, multi-split, gainable, cassette 4 voies.' },
  { e: '💨', t: 'VMC', d: 'SF, DF hygro A/B, insufflation, VMI.' },
  { e: '🚿', t: 'Plomberie', d: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
  { e: '⚡', t: 'Électricité', d: 'Mise en conformité NF C 15-100, TGBT, GTL.' },
  { e: '🔧', t: 'Entretien', d: 'Nous entretenons vos équipements avec professionnalisme et passion.' },
  { e: '🏠', t: 'Rénovation', d: 'Des solutions sur mesure pour tous vos projets.' },
  { e: '♨️', t: 'PAC', d: 'Air/air, air/eau, géothermie, aérothermie, COP > 4.' },
  { e: '💧', t: 'ECS', d: 'Ballon thermodynamique, CESI, instantané.' },
  { e: '🌡️', t: 'Régulation', d: 'Thermostat, sonde extérieure, loi d\'eau.' },
  { e: '📋', t: 'Diagnostic', d: 'Texte à venir.' },
  { e: '🛠️', t: 'Dépannage', d: 'Nous intervenons rapidement.' },
]

const REVIEWS = [1, 2, 3]

export default function HomePageSale() {
  return (
    <div className="bg-white">
      {/* ─── Hero ───────────────────────────────────────── */}
      <section className="px-4 py-10 text-center">
        {/* ❌ #5 H1 générique : ni le métier, ni la ville */}
        <h1 className="text-4xl font-bold text-purple-700 mb-4" style={{ fontFamily: 'var(--font-comic), cursive' }}>
          Bienvenue sur notre site internet !
        </h1>

        {/* ❌ #6 Pavé de texte creux typique d'IA, gris clair sur blanc (contraste illisible) */}
        <p className="max-w-3xl mx-auto text-gray-300 text-sm leading-relaxed mb-6">
          Dans un monde en constante évolution, notre entreprise s&apos;engage à vous offrir des solutions innovantes,
          durables et sur mesure. Forts de notre passion pour l&apos;excellence et de notre engagement envers la
          satisfaction client, nous mettons tout en œuvre pour répondre à vos besoins les plus exigeants. Notre équipe
          de professionnels dévoués et qualifiés est là pour vous accompagner à chaque étape de votre projet, de la
          conception à la réalisation, avec rigueur, transparence et bienveillance. Ensemble, construisons l&apos;avenir
          de votre confort. N&apos;hésitez pas à nous contacter pour toute demande d&apos;information complémentaire.
        </p>

        {/* ❌ #7 Image cassée (fichier jamais uploadé) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/IMG_20190312_hero-FINAL-v2(1).jpg"
          alt="IMG_20190312_hero-FINAL-v2(1).jpg"
          className="mx-auto mb-6 w-full max-w-2xl h-56 border border-dashed border-gray-300"
        />

        {/* ❌ #8 Cinq boutons de même poids, aux libellés vagues : aucun chemin clair */}
        <div className="flex flex-wrap justify-center gap-2">
          {['En savoir plus', 'Découvrir', 'Cliquez ici', 'Nos services', 'Voir plus'].map((b, i) => (
            <Link
              key={b}
              href="/contact"
              className={`px-4 py-2 text-white text-sm ${['bg-purple-600', 'bg-pink-500', 'bg-teal-500', 'bg-amber-500', 'bg-blue-500'][i]}`}
            >
              {b}
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Qui sommes-nous ───────────────────────────────── */}
      <section className="px-4 py-10 bg-purple-50">
        <h1 className="text-3xl font-bold text-center text-purple-700 mb-4">Qui sommes-nous ?</h1>
        {/* ❌ #9 Texte de remplissage oublié : placeholders et lorem ipsum en ligne */}
        <p className="max-w-3xl mx-auto text-center text-gray-600">
          <span className="bg-yellow-200">[Insérer ici le nom de l&apos;entreprise]</span> est une entreprise spécialisée
          dans <span className="bg-yellow-200">[votre domaine d&apos;activité]</span> basée à{' '}
          <span className="bg-yellow-200">[ville]</span>. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>

        {/* ❌ #10 Promesses invérifiables et badges vagues */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {['🏆 N°1 en France', '💯 100% satisfaits', '💶 Meilleur prix garanti', '✅ Certifié', '⭐ Qualité premium'].map((b) => (
            <span key={b} className="border-2 border-purple-600 text-purple-700 font-bold text-xs px-3 py-1 rounded-full">
              {b}
            </span>
          ))}
        </div>
      </section>

      {/* ─── Services ───────────────────────────────────── */}
      <section className="px-4 py-10">
        <h1 className="text-3xl font-bold text-center text-purple-700 mb-6">Nos services</h1>
        {/* ❌ #11 12 services en vrac, jargon technique, texte minuscule, aucun bouton d'action */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 max-w-5xl mx-auto">
          {SERVICES.map(({ e, t, d }) => (
            <div key={t} className="border border-gray-200 p-2 text-center">
              <div className="text-2xl">{e}</div>
              <div className="font-bold text-[11px]">{t}</div>
              <div className="text-[9px] text-gray-400">{d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Carrousel ──────────────────────────────────── */}
      <section className="px-4 py-10 bg-gray-50">
        <h2 className="text-3xl text-center text-pink-600 mb-4" style={{ fontFamily: 'var(--font-lobster), cursive' }}>Galerie</h2>
        {/* ❌ #12 Carrousel vide (« Image 1/8 — photo à ajouter ») : aucune vraie réalisation montrée */}
        <div className="relative mx-auto w-full max-w-xl h-56 bg-gray-300 flex items-center justify-center text-gray-500">
          <span className="text-sm">Image 1/8 — photo à ajouter</span>
          <span className="absolute left-2 text-3xl text-white">‹</span>
          <span className="absolute right-2 text-3xl text-white">›</span>
          <div className="absolute bottom-2 flex gap-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/40'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Avis ───────────────────────────────────────── */}
      <section className="px-4 py-10">
        <h2 className="text-2xl font-bold text-center text-purple-700 mb-1">Ils nous font confiance</h2>
        {/* ❌ #13 Faux avis : identiques, même auteur, même date, 3 avis seulement */}
        <p className="text-center text-xs text-gray-400 mb-6">Note moyenne : 5/5 (3 avis)</p>
        <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {REVIEWS.map((i) => (
            <div key={i} className="border p-4">
              <div className="text-yellow-400">★★★★★</div>
              <p className="text-sm italic my-2">« Super entreprise je recommande !!! Très professionnel. »</p>
              <p className="text-xs text-gray-400">Jean D. — 01/01/2023</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Contact ────────────────────────────────────── */}
      <section className="px-4 py-10 bg-purple-50 text-center">
        <h2 className="text-2xl font-bold text-purple-700 mb-3">Nous contacter</h2>
        {/* ❌ #14 Téléphone non cliquable, adresse Gmail, délai de réponse décourageant */}
        <p className="text-sm text-gray-600">Tél : 06.52.49.52.90 (du lundi au vendredi de 9h à 12h)</p>
        <p className="text-sm text-gray-600">Email : monchauff.pro75@gmail.com</p>
        <p className="text-xs text-gray-400 mt-1">Nous vous répondrons dans un délai de 7 à 10 jours ouvrés.</p>

        {/* ❌ #15 Section « en construction » laissée en ligne */}
        <div className="mt-8 inline-block bg-yellow-300 text-black font-bold px-4 py-3 border-4 border-dashed border-black">
          🚧 SITE EN CONSTRUCTION 🚧 — Certaines pages arrivent bientôt !
        </div>
      </section>
    </div>
  )
}
