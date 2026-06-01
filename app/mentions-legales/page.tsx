import type { Metadata } from 'next'
import { COMPANY_NAME, COMPANY_PHONE, COMPANY_EMAIL, COMPANY_LOCATION } from '@/lib/config'

export const metadata: Metadata = {
  title: `Mentions légales | ${COMPANY_NAME}`,
  description: `Mentions légales de ${COMPANY_NAME} — ${COMPANY_LOCATION}`,
  robots: { index: false },
}

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="container-site max-w-3xl">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
          <h1 className="font-heading font-bold text-3xl text-brand-navy mb-8">Mentions légales</h1>

          <section className="mb-8">
            <h2 className="font-heading font-semibold text-xl text-brand-navy mb-3">1. Éditeur du site</h2>
            <p className="text-slate-600 leading-relaxed">
              <strong>Raison sociale :</strong> {COMPANY_NAME}<br />
              <strong>Forme juridique :</strong> Entreprise individuelle<br />
              <strong>Zone d&apos;intervention :</strong> {COMPANY_LOCATION}<br />
              <strong>Téléphone :</strong> {COMPANY_PHONE}<br />
              <strong>Email :</strong> {COMPANY_EMAIL}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-heading font-semibold text-xl text-brand-navy mb-3">2. Hébergement</h2>
            <p className="text-slate-600 leading-relaxed">
              Ce site est hébergé par Vercel Inc.<br />
              440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br />
              <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-brand-orange hover:underline">vercel.com</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-heading font-semibold text-xl text-brand-navy mb-3">3. Propriété intellectuelle</h2>
            <p className="text-slate-600 leading-relaxed">
              L&apos;ensemble du contenu de ce site (textes, images, logos, visuels) est la propriété exclusive de {COMPANY_NAME}, sauf mentions contraires. Toute reproduction, même partielle, est interdite sans autorisation préalable.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-heading font-semibold text-xl text-brand-navy mb-3">4. Limitation de responsabilité</h2>
            <p className="text-slate-600 leading-relaxed">
              Les informations fournies sur ce site, notamment les estimations tarifaires, sont données à titre indicatif et ne constituent pas un engagement contractuel. {COMPANY_NAME} décline toute responsabilité pour les erreurs ou omissions dans le contenu du site.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-xl text-brand-navy mb-3">5. Droit applicable</h2>
            <p className="text-slate-600 leading-relaxed">
              Le présent site est soumis au droit français. Tout litige relatif à son utilisation sera de la compétence exclusive des tribunaux français.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
