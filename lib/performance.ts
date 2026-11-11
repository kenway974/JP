/**
 * Indicateurs de performance du dashboard admin.
 * Calcul pur à partir des demandes : aucun accès à la base ici (voir performance.test.ts).
 *
 * Fenêtres :
 *  - volume de demandes : 30 derniers jours, comparés aux 30 jours précédents ;
 *  - conversion, sources, délai de traitement, motifs d'abandon : 90 derniers jours.
 * Les montants sont des estimations données aux clients, jamais des devis signés.
 */

import type { LeadStatus } from '@prisma/client'

const DAY_MS = 24 * 60 * 60 * 1000
const HOUR_MS = 60 * 60 * 1000

export const PERFORMANCE_WINDOW_DAYS = 90

/** Statuts d'une demande qui peut encore aboutir à une vente. */
export const OPEN_PIPELINE_STATUSES: LeadStatus[] = [
  'QUOTE_SENT',
  'QUOTE_FOLLOW_UP',
  'VISIT_TO_PLAN',
  'APPOINTMENT_BOOKED',
  'VISIT_DONE',
]

/** Statuts de demandes écartées, avec leur motif. */
export const DISCARD_STATUSES = ['OUT_OF_ZONE', 'OUT_OF_SCOPE', 'BUDGET_MISMATCH', 'UNREACHABLE', 'LOST']

export interface PerfEvent {
  type: string
  createdAt: Date
}

export interface PerfLead {
  status: string
  source: string | null
  createdAt: Date
  estimateMin: number
  estimateMax: number
  events: PerfEvent[]
}

export interface CountShare {
  key: string
  count: number
}

export interface PerformanceStats {
  leads30: number
  leadsPrev30: number
  /** Évolution en % par rapport aux 30 jours précédents ; null s'il n'y avait aucune demande. */
  evolutionPct: number | null
  leads90: number
  converted90: number
  /** Taux en % (arrondi) ; null sans demande. */
  conversionPct: number | null
  bySource: CountShare[]
  pipeline: { count: number; min: number; max: number }
  /** Délai médian entre la demande et la première action du dirigeant, en heures ; null si aucune action. */
  medianFirstActionHours: number | null
  discarded: CountShare[]
}

/** Première action humaine : un changement de statut ou une note (les e-mails automatiques ne comptent pas). */
export function firstActionDelayHours(lead: PerfLead): number | null {
  const times = lead.events
    .filter((e) => e.type === 'STATUS_CHANGED' || e.type === 'NOTE')
    .map((e) => e.createdAt.getTime())
    .filter((t) => t >= lead.createdAt.getTime())
  if (times.length === 0) return null
  return (Math.min(...times) - lead.createdAt.getTime()) / HOUR_MS
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function countBy(values: string[]): CountShare[] {
  const map = new Map<string, number>()
  for (const v of values) map.set(v, (map.get(v) ?? 0) + 1)
  return [...map.entries()].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count)
}

export function computePerformance(leads: PerfLead[], now: Date): PerformanceStats {
  const t = now.getTime()
  const inRange = (lead: PerfLead, fromDays: number, toDays: number) => {
    const age = t - lead.createdAt.getTime()
    return age >= toDays * DAY_MS && age < fromDays * DAY_MS
  }

  const leads30 = leads.filter((l) => inRange(l, 30, 0)).length
  const leadsPrev30 = leads.filter((l) => inRange(l, 60, 30)).length
  const evolutionPct = leadsPrev30 === 0 ? null : Math.round(((leads30 - leadsPrev30) / leadsPrev30) * 100)

  const window90 = leads.filter((l) => inRange(l, PERFORMANCE_WINDOW_DAYS, 0))
  const converted90 = window90.filter((l) => l.status === 'CONVERTED').length

  const pipelineLeads = leads.filter((l) => (OPEN_PIPELINE_STATUSES as string[]).includes(l.status))

  const delays = window90.map(firstActionDelayHours).filter((d): d is number => d !== null)
  const medianDelay = median(delays)

  return {
    leads30,
    leadsPrev30,
    evolutionPct,
    leads90: window90.length,
    converted90,
    conversionPct: window90.length === 0 ? null : Math.round((converted90 / window90.length) * 100),
    bySource: countBy(window90.map((l) => l.source ?? 'inconnue')),
    pipeline: {
      count: pipelineLeads.length,
      min: pipelineLeads.reduce((sum, l) => sum + l.estimateMin, 0),
      max: pipelineLeads.reduce((sum, l) => sum + l.estimateMax, 0),
    },
    medianFirstActionHours: medianDelay === null ? null : Math.round(medianDelay * 10) / 10,
    discarded: countBy(window90.filter((l) => DISCARD_STATUSES.includes(l.status)).map((l) => l.status)),
  }
}

/** « 3 h », « 1 j 4 h » : lisible par un non-technicien. */
export function formatDelay(hours: number | null): string {
  if (hours === null) return '—'
  if (hours < 1) return 'moins d’1 h'
  if (hours < 24) return `${Math.round(hours)} h`
  const days = Math.floor(hours / 24)
  const rest = Math.round(hours - days * 24)
  return rest === 0 ? `${days} j` : `${days} j ${rest} h`
}
