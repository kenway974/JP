import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, PiggyBank } from 'lucide-react'

// Page provisoire : le simulateur d'aides (MaPrimeRénov', CEE, TVA réduite,
// crédit d'impôt services à la personne…) sera construit dans une prochaine itération.
export const metadata: Metadata = {
  title: 'Simulateur d\'aides et de réduction d\'impôt',
  robots: { index: false },
}

export default function SimulateurAidesPage() {
  return (
    <div className="min-h-[60vh] bg-slate-50 py-16">
      <div className="container-site max-w-2xl">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
          <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-5">
            <PiggyBank className="h-7 w-7 text-brand-orange" aria-hidden="true" />
          </div>
          <h1 className="font-heading font-bold text-3xl text-brand-navy mb-3">Simulateur d&apos;aides</h1>
          <p className="text-slate-600 mb-8">
            Notre simulateur d&apos;aides et de réduction d&apos;impôt arrive bientôt. En attendant, faites votre
            estimation gratuite : nous vous indiquerons les aides auxquelles vous avez droit.
          </p>
          <Link href="/estimation" className="btn-primary justify-center">
            Estimation gratuite <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  )
}
