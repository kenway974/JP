/**
 * Règles des relances automatiques.
 *
 * Ce fichier ne touche ni à la base ni aux e-mails : il décide, à partir des données
 * d'un lead, s'il faut le relancer et de quelle façon. Il est donc testable seul
 * (voir follow-up-rules.test.ts).
 *
 * Deux relances existent :
 *  - « estimation » : le client a reçu l'estimation indicative envoyée automatiquement
 *    par le site et n'a donné aucune suite.
 *  - « devis » : le dirigeant a marqué le devis formel comme envoyé (statut « Devis envoyé »
 *    posé depuis l'admin) et le client n'a pas répondu.
 */

export type FollowUpKind = 'estimation' | 'devis'

export interface RuleEvent {
  type: string
  createdAt: Date
  metadata: unknown
}

export interface RuleLead {
  id: string
  status: string
  email: string | null
  createdAt: Date
  hasBooking: boolean
  events: RuleEvent[]
}

export interface FollowUpConfig {
  /** Délai avant relance d'une estimation restée sans suite. */
  estimationDelayDays: number
  /** Délai avant relance d'un devis formel resté sans réponse. */
  quoteDelayDays: number
  /** Au-delà, une demande est considérée comme trop ancienne pour être relancée. */
  maxAgeDays: number
  /** Plafond d'e-mails de relance par exécution. */
  maxPerRun: number
  /** Interrupteur général des relances automatiques. */
  disabled: boolean
}

export interface FollowUpDecision {
  kind: FollowUpKind
  /** Date du dernier envoi (estimation ou devis) qui déclenche le délai. */
  since: Date
}

const DAY_MS = 24 * 60 * 60 * 1000

function positiveInt(value: string | undefined, fallback: number): number {
  const n = Number.parseInt(value ?? '', 10)
  return Number.isFinite(n) && n >= 1 ? n : fallback
}

export function loadFollowUpConfig(env: Record<string, string | undefined> = process.env): FollowUpConfig {
  return {
    estimationDelayDays: positiveInt(env.FOLLOW_UP_ESTIMATE_DAYS, 3),
    quoteDelayDays: positiveInt(env.FOLLOW_UP_QUOTE_DAYS, 7),
    maxAgeDays: positiveInt(env.FOLLOW_UP_MAX_AGE_DAYS, 21),
    maxPerRun: positiveInt(env.FOLLOW_UP_MAX_PER_RUN, 20),
    disabled: env.AUTO_FOLLOW_UP_DISABLED === 'true',
  }
}

function meta(event: RuleEvent): Record<string, unknown> {
  return event.metadata && typeof event.metadata === 'object' && !Array.isArray(event.metadata)
    ? (event.metadata as Record<string, unknown>)
    : {}
}

function latest(events: RuleEvent[], predicate: (e: RuleEvent) => boolean): RuleEvent | undefined {
  return events
    .filter(predicate)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]
}

const PLACEHOLDER_DOMAINS = new Set(['example.com', 'example.org', 'example.net'])
const PLACEHOLDER_SUFFIXES = ['.test', '.invalid', '.example', '.localhost']

/** Adresses de démonstration ou non livrables : on ne leur envoie jamais de relance. */
export function isPlaceholderEmail(email: string): boolean {
  const domain = email.split('@')[1]?.trim().toLowerCase()
  if (!domain) return true
  return PLACEHOLDER_DOMAINS.has(domain) || PLACEHOLDER_SUFFIXES.some((s) => domain.endsWith(s))
}

/**
 * Détermine de quel type de relance relève un lead au statut « Devis envoyé ».
 * - Devis formel : le dirigeant a posé lui-même le statut depuis l'admin (événement STATUS_CHANGED).
 * - Estimation : l'e-mail a été envoyé par le site (événement QUOTE_EMAIL_SENT).
 */
export function classifyQuoteLead(lead: RuleLead): FollowUpDecision | null {
  if (lead.status !== 'QUOTE_SENT') return null

  const formal = latest(lead.events, (e) => e.type === 'STATUS_CHANGED' && meta(e).to === 'QUOTE_SENT')
  const estimate = latest(lead.events, (e) => e.type === 'QUOTE_EMAIL_SENT')

  if (formal && (!estimate || formal.createdAt > estimate.createdAt)) {
    return { kind: 'devis', since: formal.createdAt }
  }
  if (estimate) return { kind: 'estimation', since: estimate.createdAt }
  return null
}

function alreadyFollowedUp(lead: RuleLead, decision: FollowUpDecision): boolean {
  return lead.events.some(
    (e) =>
      e.type === 'FOLLOW_UP_SENT' &&
      meta(e).kind === decision.kind &&
      e.createdAt.getTime() >= decision.since.getTime(),
  )
}

/** Retourne la relance à faire pour ce lead, ou null s'il n'y a rien à faire. */
export function decideFollowUp(lead: RuleLead, now: Date, config: FollowUpConfig): FollowUpDecision | null {
  if (config.disabled) return null
  if (!lead.email || isPlaceholderEmail(lead.email)) return null
  if (lead.hasBooking) return null
  if (now.getTime() - lead.createdAt.getTime() > config.maxAgeDays * DAY_MS) return null

  const decision = classifyQuoteLead(lead)
  if (!decision) return null

  const delayDays = decision.kind === 'devis' ? config.quoteDelayDays : config.estimationDelayDays
  if (now.getTime() - decision.since.getTime() < delayDays * DAY_MS) return null
  if (alreadyFollowedUp(lead, decision)) return null

  return decision
}

export interface SelectedFollowUp {
  leadId: string
  decision: FollowUpDecision
}

/** Sélectionne les relances de l'exécution : les plus anciennes d'abord, dans la limite du plafond. */
export function selectFollowUps(leads: RuleLead[], now: Date, config: FollowUpConfig): SelectedFollowUp[] {
  return leads
    .map((lead) => ({ leadId: lead.id, decision: decideFollowUp(lead, now, config) }))
    .filter((x): x is SelectedFollowUp => x.decision !== null)
    .sort((a, b) => a.decision.since.getTime() - b.decision.since.getTime())
    .slice(0, config.maxPerRun)
}

/** Type de relance à utiliser pour un envoi manuel depuis la fiche d'un lead. */
export function manualFollowUpKind(lead: RuleLead): FollowUpKind {
  const decision = classifyQuoteLead(lead)
  if (decision) return decision.kind
  return lead.status === 'QUOTE_FOLLOW_UP' ? 'devis' : 'estimation'
}
