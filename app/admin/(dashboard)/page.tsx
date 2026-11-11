import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Users, Calendar, Star, TrendingUp } from 'lucide-react'
import {
  LEAD_STATUS_LABELS,
  LEAD_STATUS_STYLES,
  SERVICE_SHORT_LABELS,
  SOURCE_LABELS,
  label,
  formatEuroRange,
  isLeadStatus,
} from '@/lib/lead-labels'
import {
  computePerformance,
  formatDelay,
  OPEN_PIPELINE_STATUSES,
  PERFORMANCE_WINDOW_DAYS,
  type PerformanceStats,
} from '@/lib/performance'

async function getStats() {
  try {
    const [totalLeads, newLeads, bookings, reviews] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.review.count({ where: { published: false } }),
    ])
    return { totalLeads, newLeads, bookings, reviews }
  } catch {
    return { totalLeads: 0, newLeads: 0, bookings: 0, reviews: 0 }
  }
}

async function getPerformance(): Promise<PerformanceStats | null> {
  try {
    const now = new Date()
    const since = new Date(now.getTime() - PERFORMANCE_WINDOW_DAYS * 24 * 60 * 60 * 1000)
    const leads = await prisma.lead.findMany({
      where: { OR: [{ createdAt: { gte: since } }, { status: { in: OPEN_PIPELINE_STATUSES } }] },
      select: {
        status: true,
        source: true,
        createdAt: true,
        estimateMin: true,
        estimateMax: true,
        events: { where: { type: { in: ['STATUS_CHANGED', 'NOTE'] } }, select: { type: true, createdAt: true } },
      },
    })
    return computePerformance(leads, now)
  } catch {
    return null
  }
}

function Metric({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="text-2xl font-bold text-slate-800 mt-1">{value}</div>
      {hint && <div className="text-xs text-slate-400 mt-1">{hint}</div>}
    </div>
  )
}

function PerformanceBlock({ stats }: { stats: PerformanceStats }) {
  const evolution =
    stats.evolutionPct === null
      ? 'pas de période de comparaison'
      : `${stats.evolutionPct > 0 ? '+' : ''}${stats.evolutionPct} % vs 30 jours précédents`
  const topSource = stats.bySource[0]?.count ?? 1

  return (
    <section className="mb-8" aria-labelledby="performance-title">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h2 id="performance-title" className="text-lg font-semibold text-slate-800">Performance du site</h2>
        <span className="text-xs text-slate-400">Conversion, sources et abandons : {PERFORMANCE_WINDOW_DAYS} derniers jours</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Metric title="Demandes (30 jours)" value={String(stats.leads30)} hint={evolution} />
        <Metric
          title="Taux de conversion"
          value={stats.conversionPct === null ? '—' : `${stats.conversionPct} %`}
          hint={`${stats.converted90} gagnée(s) sur ${stats.leads90} demande(s)`}
        />
        <Metric
          title="Devis en cours"
          value={stats.pipeline.count === 0 ? '—' : formatEuroRange(stats.pipeline.min, stats.pipeline.max)}
          hint={`${stats.pipeline.count} demande(s) ouverte(s), valeur estimée`}
        />
        <Metric
          title="Première réponse"
          value={formatDelay(stats.medianFirstActionHours)}
          hint="délai médian de traitement"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-3 text-sm">D’où viennent les demandes</h3>
          {stats.bySource.length === 0 ? (
            <p className="text-sm text-slate-400">Pas encore de demande.</p>
          ) : (
            <ul className="space-y-2.5">
              {stats.bySource.map((s) => (
                <li key={s.key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700">{SOURCE_LABELS[s.key] ?? 'Autre'}</span>
                    <span className="text-slate-500">{s.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-brand-orange" style={{ width: `${Math.round((s.count / topSource) * 100)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-3 text-sm">Pourquoi on perd des demandes</h3>
          {stats.discarded.length === 0 ? (
            <p className="text-sm text-slate-400">Aucune demande écartée.</p>
          ) : (
            <ul className="space-y-2">
              {stats.discarded.map((d) => (
                <li key={d.key} className="flex justify-between text-sm">
                  <span className="text-slate-700">{isLeadStatus(d.key) ? LEAD_STATUS_LABELS[d.key] : d.key}</span>
                  <span className="text-slate-500">{d.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

async function getRecentLeads() {
  try {
    return await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    })
  } catch {
    return []
  }
}

export default async function AdminPage() {
  const [stats, leads, performance] = await Promise.all([getStats(), getRecentLeads(), getPerformance()])

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Users, label: 'Leads total', value: stats.totalLeads, color: 'text-blue-500 bg-blue-50' },
          { icon: TrendingUp, label: 'Cette semaine', value: stats.newLeads, color: 'text-emerald-500 bg-emerald-50' },
          { icon: Calendar, label: 'RDV en attente', value: stats.bookings, color: 'text-orange-500 bg-orange-50' },
          { icon: Star, label: 'Avis à modérer', value: stats.reviews, color: 'text-purple-500 bg-purple-50' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-slate-800">{value}</div>
            <div className="text-sm text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      {performance && <PerformanceBlock stats={performance} />}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Derniers leads</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['Prénom', 'Ville', 'Service', 'Estimation', 'Statut', 'Date'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    <Link href={`/admin/leads/${lead.id}`} className="hover:text-brand-navy hover:underline">
                      {lead.firstName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{lead.city}</td>
                  <td className="px-4 py-3 text-slate-500">{label(SERVICE_SHORT_LABELS, lead.serviceType)}</td>
                  <td className="px-4 py-3 text-slate-700">{lead.estimateMin.toLocaleString('fr-FR')}–{lead.estimateMax.toLocaleString('fr-FR')}€</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${LEAD_STATUS_STYLES[lead.status]}`}>
                      {LEAD_STATUS_LABELS[lead.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{new Date(lead.createdAt).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Aucun lead pour le moment</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
