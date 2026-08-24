import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { RealisationCard } from '@/components/realisations/RealisationCard'
import { COMPANY_SHORT_NAME, COMPANY_LOCATION } from '@/lib/config'

export const metadata: Metadata = {
  title: `Nos réalisations — Chauffage, Climatisation, VMC | ${COMPANY_SHORT_NAME}`,
  description: `Découvrez nos chantiers récents en chauffage, climatisation et VMC en ${COMPANY_LOCATION}.`,
}

async function getRealisations() {
  try {
    return await prisma.realisation.findMany({
      where: { published: true },
      orderBy: { completedAt: 'desc' },
    })
  } catch {
    return []
  }
}

export default async function RealisationsPage() {
  const realisations = await getRealisations()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-brand-navy py-16 text-white text-center">
        <h1 className="font-heading font-bold text-4xl mb-3">Nos réalisations</h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Un aperçu de nos chantiers récents — chauffage, climatisation, ventilation et plus encore.
        </p>
      </div>

      <div className="container-site py-12">
        {realisations.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-lg">Nos prochaines réalisations arrivent bientôt…</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {realisations.map((r) => <RealisationCard key={r.id} {...r} />)}
          </div>
        )}
      </div>
    </div>
  )
}
