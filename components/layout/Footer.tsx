import Link from 'next/link'
import { Phone, Mail, Instagram, MapPin, Clock, Flame, Shield, Award } from 'lucide-react'
import { COMPANY_NAME, COMPANY_SHORT_NAME, COMPANY_PHONE, COMPANY_PHONE_RAW, COMPANY_EMAIL, COMPANY_LOCATION, COMPANY_SINCE } from '@/lib/config'

export function Footer() {
  return (
    <footer className="bg-brand-navy-dark text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Colonne 1 - À propos */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="rounded-lg bg-brand-orange p-1.5">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-white text-base">{COMPANY_SHORT_NAME}</span>
                <span className="text-slate-400 text-sm block">Chauffagiste</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Entreprise familiale spécialisée en chauffage, climatisation, VMC, plomberie et électricité en {COMPANY_LOCATION}. Plus de 15 ans d&apos;expérience à votre service.
            </p>
            <div className="flex gap-3">
              <div className="flex items-center gap-1 text-xs">
                <Shield className="h-4 w-4 text-brand-orange" />
                <span>Certifié RGE</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Award className="h-4 w-4 text-brand-orange" />
                <span>Depuis {COMPANY_SINCE}</span>
              </div>
            </div>
          </div>

          {/* Colonne 2 - Services */}
          <div>
            <h3 className="font-semibold text-white mb-4">Nos services</h3>
            <ul className="space-y-2 text-sm">
              {[
                'Installation chaudière',
                'Pompe à chaleur (PAC)',
                'Climatisation réversible',
                'VMC simple / double flux',
                'Plomberie générale',
                'Dépannage urgence 24h/7j',
                'Entretien & maintenance',
                'Rénovation complète',
              ].map((s) => (
                <li key={s}>
                  <Link href="/estimation" className="hover:text-white transition-colors hover:underline">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 - Liens */}
          <div>
            <h3 className="font-semibold text-white mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/estimation', label: 'Estimation gratuite' },
                { href: '/rendez-vous', label: 'Prendre rendez-vous' },
                { href: '/rappel', label: 'Être rappelé(e)' },
                { href: '/realisations', label: 'Nos réalisations' },
                { href: '/blog', label: 'Blog & conseils' },
                { href: '/avis', label: 'Avis clients' },
                { href: '/contact', label: 'Contact' },
                { href: '/mentions-legales', label: 'Mentions légales' },
                { href: '/confidentialite', label: 'Confidentialité' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition-colors hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 4 - Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={`tel:${COMPANY_PHONE_RAW}`} className="flex items-center gap-2 hover:text-white transition-colors group">
                  <Phone className="h-4 w-4 text-brand-orange group-hover:scale-110 transition-transform" />
                  <span>{COMPANY_PHONE}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${COMPANY_EMAIL}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail className="h-4 w-4 text-brand-orange" />
                  <span className="break-all">{COMPANY_EMAIL}</span>
                </a>
              </li>
              <li>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Instagram className="h-4 w-4 text-brand-orange" />
                  <span>Instagram</span>
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-brand-orange mt-0.5 flex-shrink-0" />
                <span>{COMPANY_LOCATION}</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-brand-orange mt-0.5 flex-shrink-0" />
                <span>Disponible 24h/24 — 7j/7</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {COMPANY_NAME}. Tous droits réservés.</p>
          <p>Chauffagiste {COMPANY_LOCATION} · Installation · Entretien · Dépannage</p>
        </div>
      </div>
    </footer>
  )
}
