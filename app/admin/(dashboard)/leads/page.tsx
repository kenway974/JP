import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { LeadStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  LEAD_GROUPS,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_STYLES,
  SERVICE_SHORT_LABELS,
  HOUSING_SHORT_LABELS,
  BUILDING_AGE_SHORT_LABELS,
  URGENCY_LABELS,
  SPECIFICITY_LABELS,
  label,
  findGroup,
  formatEuroRange,
} from '@/lib/lead-labels'

const MAX_VISIBLE_SPECIFICITIES = 2

async function getLeads(statuses?: LeadStatus[]) {
  try {
    return await prisma.lead.findMany({
      where: statuses ? { status: { in: statuses } } : undefined,
      orderBy: { createdAt: 'desc' },
    })
  } catch {
    return []
  }
}

async function getStatusCounts(): Promise<Record<string, number>> {
  try {
    const rows = await prisma.lead.groupBy({ by: ['status'], _count: { _all: true } })
    return Object.fromEntries(rows.map((r) => [r.status, r._count._all]))
  } catch {
    return {}
  }
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ groupe?: string }>
}) {
  const { groupe } = await searchParams
  const activeGroup = findGroup(groupe)
  const [leads, counts] = await Promise.all([getLeads(activeGroup?.statuses), getStatusCounts()])
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0)

  const chipClass = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
      active
        ? 'bg-slate-800 text-white border-slate-800'
        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
    }`

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Demandes d&apos;estimation</h1>
      <p className="text-sm text-slate-500 mb-5">
        Chaque ligne est une demande reçue via le formulaire d&apos;estimation. Ouvrez-la pour la qualifier ou l&apos;écarter.
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
        <Link href="/admin/leads" className={chipClass(!activeGroup)}>
          Toutes ({total})
        </Link>
        {LEAD_GROUPS.map((g) => {
          const n = g.statuses.reduce((sum, s) => sum + (counts[s] ?? 0), 0)
          return (
            <Link key={g.key} href={`/admin/leads?groupe=${g.key}`} className={chipClass(activeGroup?.key === g.key)}>
              {g.label} ({n})
            </Link>
          )
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['Contact', 'Demande', 'Urgence', 'Particularités', 'Estimation', 'Statut', 'Reçu le', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {leads.map((lead) => {
                const visible = lead.specificities.slice(0, MAX_VISIBLE_SPECIFICITIES)
                const hidden = lead.specificities.length - visible.length
                return (
                  <tr key={lead.id} className="hover:bg-slate-50 align-top">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="font-medium text-slate-800 hover:text-brand-navy hover:underline"
                      >
                        {lead.firstName}
                      </Link>
                      <div className="text-slate-700">{lead.phone}</div>
                      {lead.email && <div className="text-slate-400 text-xs">{lead.email}</div>}
                      <div className="text-slate-400 text-xs">{lead.city}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="font-medium text-slate-700">{label(SERVICE_SHORT_LABELS, lead.serviceType)}</div>
                      <div className="text-xs text-slate-500">
                        {label(HOUSING_SHORT_LABELS, lead.housingType)}
                        {lead.surface ? ` · ${lead.surface} m²` : ''}
                      </div>
                      {lead.buildingAge && (
                        <div className="text-xs text-slate-400">{label(BUILDING_AGE_SHORT_LABELS, lead.buildingAge)}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          lead.urgency === 'URGENT' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {label(URGENCY_LABELS, lead.urgency)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {lead.specificities.length === 0 ? (
                        <span className="text-slate-300">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {visible.map((s) => (
                            <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs">
                              {label(SPECIFICITY_LABELS, s)}
                            </span>
                          ))}
                          {hidden > 0 && <span className="text-xs text-slate-400 self-center">+{hidden}</span>}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {formatEuroRange(lead.estimateMin, lead.estimateMax)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${LEAD_STATUS_STYLES[lead.status]}`}>
                        {LEAD_STATUS_LABELS[lead.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {format(lead.createdAt, 'dd/MM/yy HH:mm', { locale: fr })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="text-xs font-medium text-brand-navy hover:underline"
                      >
                        Voir la demande →
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    {activeGroup ? 'Aucune demande dans cette catégorie' : 'Aucune demande pour le moment'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
