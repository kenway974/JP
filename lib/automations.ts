import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  sendDailyDigest,
  sendFollowUpEmail,
  digestHasContent,
  getDigestRecipient,
  type DigestData,
  type DigestLeadItem,
} from '@/lib/email'
import {
  loadFollowUpConfig,
  selectFollowUps,
  manualFollowUpKind,
  isPlaceholderEmail,
  type FollowUpKind,
  type RuleLead,
} from '@/lib/follow-up-rules'
import { LEAD_GROUPS, SERVICE_SHORT_LABELS, label } from '@/lib/lead-labels'

/**
 * Orchestration des automatisations : relances clients et récap quotidien.
 * Les règles de décision sont dans follow-up-rules.ts (testées à part).
 */

const leadWithEvents = {
  events: { select: { type: true, createdAt: true, metadata: true } },
  booking: { select: { id: true } },
} satisfies Prisma.LeadInclude

type LeadWithEvents = Prisma.LeadGetPayload<{ include: typeof leadWithEvents }>

export const KIND_LABELS: Record<FollowUpKind, string> = {
  estimation: 'relance de l’estimation',
  devis: 'relance du devis',
}

function toRuleLead(lead: LeadWithEvents): RuleLead {
  return {
    id: lead.id,
    status: lead.status,
    email: lead.email,
    createdAt: lead.createdAt,
    hasBooking: lead.booking !== null,
    events: lead.events.map((e) => ({ type: e.type, createdAt: e.createdAt, metadata: e.metadata })),
  }
}

export interface FollowUpCandidate {
  leadId: string
  firstName: string
  email: string
  kind: FollowUpKind
  since: Date
}

/** Leads à relancer maintenant, sans rien envoyer (sert à l'aperçu admin et au mode test). */
export async function findFollowUpCandidates(now = new Date()): Promise<FollowUpCandidate[]> {
  const config = loadFollowUpConfig()
  if (config.disabled) return []

  const since = new Date(now.getTime() - config.maxAgeDays * 24 * 60 * 60 * 1000)
  const leads = await prisma.lead.findMany({
    where: { status: 'QUOTE_SENT', email: { not: null }, createdAt: { gte: since } },
    include: leadWithEvents,
    orderBy: { createdAt: 'asc' },
  })

  const byId = new Map(leads.map((l) => [l.id, l]))
  return selectFollowUps(leads.map(toRuleLead), now, config).flatMap(({ leadId, decision }) => {
    const lead = byId.get(leadId)
    if (!lead || !lead.email) return []
    return [{ leadId, firstName: lead.firstName, email: lead.email, kind: decision.kind, since: decision.since }]
  })
}

export interface FollowUpResult {
  leadId: string
  firstName: string
  kind: FollowUpKind
  ok: boolean
  error?: string
}

async function deliverFollowUp(lead: LeadWithEvents, kind: FollowUpKind, manual: boolean): Promise<void> {
  if (!lead.email) throw new Error('Pas d’adresse e-mail')
  await sendFollowUpEmail({
    to: lead.email,
    firstName: lead.firstName,
    kind,
    serviceType: label(SERVICE_SHORT_LABELS, lead.serviceType),
    estimateMin: lead.estimateMin,
    estimateMax: lead.estimateMax,
    prospectId: lead.prospectId,
  })

  // Tracé uniquement après un envoi réussi : en cas d'échec, la relance sera retentée au prochain passage.
  const ops: Prisma.PrismaPromise<unknown>[] = [
    prisma.leadEvent.create({
      data: {
        leadId: lead.id,
        type: 'FOLLOW_UP_SENT',
        metadata: { kind, email: lead.email, ...(manual ? { manual: true } : {}) },
      },
    }),
  ]
  if (kind === 'devis' && lead.status === 'QUOTE_SENT') {
    ops.push(
      prisma.lead.update({ where: { id: lead.id }, data: { status: 'QUOTE_FOLLOW_UP' } }),
      prisma.leadEvent.create({
        data: {
          leadId: lead.id,
          type: 'STATUS_CHANGED',
          metadata: { from: 'QUOTE_SENT', to: 'QUOTE_FOLLOW_UP', auto: true },
        },
      }),
    )
  }
  await prisma.$transaction(ops)
}

/** Relances automatiques : un échec sur un lead n'empêche pas les suivants. */
export async function runFollowUps(options: { dryRun?: boolean; now?: Date } = {}): Promise<{
  candidates: FollowUpCandidate[]
  results: FollowUpResult[]
}> {
  const now = options.now ?? new Date()
  const candidates = await findFollowUpCandidates(now)
  if (options.dryRun || candidates.length === 0) return { candidates, results: [] }

  const results: FollowUpResult[] = []
  for (const c of candidates) {
    try {
      const lead = await prisma.lead.findUnique({ where: { id: c.leadId }, include: leadWithEvents })
      if (!lead) throw new Error('Lead introuvable')
      await deliverFollowUp(lead, c.kind, false)
      results.push({ leadId: c.leadId, firstName: c.firstName, kind: c.kind, ok: true })
    } catch (err) {
      console.error('[follow-up] échec', c.leadId, err)
      results.push({
        leadId: c.leadId,
        firstName: c.firstName,
        kind: c.kind,
        ok: false,
        error: err instanceof Error ? err.message : 'Erreur inconnue',
      })
    }
  }
  return { candidates, results }
}

/** Relance envoyée à la main depuis la fiche d'un lead. Retourne le type envoyé. */
export async function sendManualFollowUp(leadId: string): Promise<FollowUpKind> {
  const lead = await prisma.lead.findUnique({ where: { id: leadId }, include: leadWithEvents })
  if (!lead) throw new Error('Lead introuvable')
  if (!lead.email || isPlaceholderEmail(lead.email)) throw new Error('Ce contact n’a pas d’adresse e-mail valide')
  const kind = manualFollowUpKind(toRuleLead(lead))
  await deliverFollowUp(lead, kind, true)
  return kind
}

/* ------------------------------ Récap quotidien ------------------------------ */

function toDigestItem(lead: {
  id: string
  firstName: string
  city: string
  serviceType: string
  urgency: string
  estimateMin: number
  estimateMax: number
}): DigestLeadItem {
  return {
    id: lead.id,
    firstName: lead.firstName,
    city: lead.city,
    serviceLabel: label(SERVICE_SHORT_LABELS, lead.serviceType),
    urgent: lead.urgency === 'URGENT',
    estimateMin: lead.estimateMin,
    estimateMax: lead.estimateMax,
  }
}

function groupStatuses(key: string) {
  return LEAD_GROUPS.find((g) => g.key === key)?.statuses ?? []
}

export async function buildDigestData(
  now = new Date(),
  followUpsSent: { firstName: string; kindLabel: string }[] = [],
): Promise<DigestData> {
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const [newLeads, toProcessCount, toCompleteCount, visitsToPlan, quotesToFollowUp] = await Promise.all([
    prisma.lead.findMany({ where: { createdAt: { gte: dayAgo } }, orderBy: { createdAt: 'desc' } }),
    prisma.lead.count({ where: { status: { in: groupStatuses('a-traiter') } } }),
    prisma.lead.count({ where: { status: { in: groupStatuses('a-completer') } } }),
    prisma.lead.findMany({ where: { status: 'VISIT_TO_PLAN' }, orderBy: { createdAt: 'asc' } }),
    prisma.lead.findMany({ where: { status: 'QUOTE_FOLLOW_UP' }, orderBy: { updatedAt: 'asc' } }),
  ])

  return {
    dateLabel: new Intl.DateTimeFormat('fr-FR', {
      timeZone: 'Europe/Paris',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(now),
    newLeads: newLeads.map(toDigestItem),
    toProcessCount,
    toCompleteCount,
    visitsToPlan: visitsToPlan.map(toDigestItem),
    quotesToFollowUp: quotesToFollowUp.map(toDigestItem),
    followUpsSent,
  }
}

/** Envoie le récap. `force` : envoi même s'il n'y a rien à signaler (bouton manuel de l'admin). */
export async function sendDigest(options: {
  force?: boolean
  followUpsSent?: { firstName: string; kindLabel: string }[]
  now?: Date
} = {}): Promise<{ sent: boolean; to: string; data: DigestData }> {
  const data = await buildDigestData(options.now, options.followUpsSent ?? [])
  const to = getDigestRecipient()
  if (!options.force && !digestHasContent(data)) return { sent: false, to, data }
  await sendDailyDigest(data)
  return { sent: true, to, data }
}

/** Passage quotidien complet : relances, puis récap qui les mentionne. */
export async function runDailyAutomations(now = new Date()) {
  const followUps = await runFollowUps({ now })
  const sentList = followUps.results
    .filter((r) => r.ok)
    .map((r) => ({ firstName: r.firstName, kindLabel: KIND_LABELS[r.kind] }))
  const digest = await sendDigest({ followUpsSent: sentList, now })
  return {
    followUps: {
      eligible: followUps.candidates.length,
      sent: followUps.results.filter((r) => r.ok).length,
      failed: followUps.results.filter((r) => !r.ok).length,
    },
    digest: { sent: digest.sent },
  }
}
