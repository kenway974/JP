import type { LeadStatus, EventType } from '@prisma/client'
import { WIZARD_STEPS } from '@/components/wizard/questions'

/**
 * Libellés et règles métier des leads, utilisés par le back-office.
 *
 * Les libellés de la demande (prestation, logement, âge, urgence, particularités)
 * sont lus directement dans le wizard d'estimation : ce que le dirigeant voit dans
 * l'admin est donc toujours identique à ce que le prospect a choisi dans le formulaire.
 */

function optionLabels(field: string): Record<string, string> {
  const step = WIZARD_STEPS.find((s) => s.field === field)
  return Object.fromEntries((step?.options ?? []).map((o) => [o.value, o.label]))
}

export const SERVICE_SHORT_LABELS = optionLabels('serviceType')
export const HOUSING_SHORT_LABELS = optionLabels('housingType')
export const BUILDING_AGE_SHORT_LABELS = optionLabels('buildingAge')
export const URGENCY_LABELS = optionLabels('urgency')
export const SPECIFICITY_LABELS = optionLabels('specificities')

/** Retourne le libellé français, ou la valeur brute si elle est inconnue. */
export function label(map: Record<string, string>, value: string | null | undefined): string {
  if (!value) return '—'
  return map[value] ?? value
}

/* -------------------------------------------------------------------------- */
/*  Statuts                                                                   */
/* -------------------------------------------------------------------------- */

/** Ordre du parcours : de l'arrivée de la demande jusqu'à sa conclusion. */
export const LEAD_STATUSES: LeadStatus[] = [
  'ESTIMATE_VIEWED',
  'CALLBACK_REQUESTED',
  'INFO_INCOMPLETE',
  'AWAITING_CLIENT',
  'VISIT_TO_PLAN',
  'APPOINTMENT_BOOKED',
  'VISIT_DONE',
  'QUOTE_SENT',
  'QUOTE_FOLLOW_UP',
  'CONTACTED',
  'CONVERTED',
  'OUT_OF_ZONE',
  'OUT_OF_SCOPE',
  'BUDGET_MISMATCH',
  'UNREACHABLE',
  'LOST',
]

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  ESTIMATE_VIEWED: 'Nouvelle demande',
  CALLBACK_REQUESTED: 'Rappel demandé',
  INFO_INCOMPLETE: 'Infos à compléter',
  AWAITING_CLIENT: 'En attente du client',
  VISIT_TO_PLAN: 'Visite à planifier',
  APPOINTMENT_BOOKED: 'Visite planifiée',
  VISIT_DONE: 'Visite effectuée',
  QUOTE_SENT: 'Devis envoyé',
  QUOTE_FOLLOW_UP: 'Devis à relancer',
  CONTACTED: 'Contacté',
  CONVERTED: 'Devis accepté',
  OUT_OF_ZONE: 'Hors zone',
  OUT_OF_SCOPE: 'Hors prestations',
  BUDGET_MISMATCH: 'Budget incompatible',
  UNREACHABLE: 'Injoignable',
  LOST: 'Perdu',
}

export const LEAD_STATUS_STYLES: Record<LeadStatus, string> = {
  ESTIMATE_VIEWED: 'bg-slate-100 text-slate-700',
  CALLBACK_REQUESTED: 'bg-orange-100 text-orange-700',
  INFO_INCOMPLETE: 'bg-amber-100 text-amber-800',
  AWAITING_CLIENT: 'bg-yellow-100 text-yellow-800',
  VISIT_TO_PLAN: 'bg-indigo-100 text-indigo-700',
  APPOINTMENT_BOOKED: 'bg-purple-100 text-purple-700',
  VISIT_DONE: 'bg-fuchsia-100 text-fuchsia-700',
  QUOTE_SENT: 'bg-blue-100 text-blue-700',
  QUOTE_FOLLOW_UP: 'bg-sky-100 text-sky-700',
  CONTACTED: 'bg-cyan-100 text-cyan-700',
  CONVERTED: 'bg-emerald-100 text-emerald-700',
  OUT_OF_ZONE: 'bg-red-100 text-red-700',
  OUT_OF_SCOPE: 'bg-red-100 text-red-700',
  BUDGET_MISMATCH: 'bg-red-100 text-red-700',
  UNREACHABLE: 'bg-red-100 text-red-700',
  LOST: 'bg-red-100 text-red-700',
}

export function isLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === 'string' && (LEAD_STATUSES as string[]).includes(value)
}

/** Statuts qui terminent le traitement d'une demande. */
export const CLOSED_STATUSES: LeadStatus[] = [
  'CONVERTED',
  'OUT_OF_ZONE',
  'OUT_OF_SCOPE',
  'BUDGET_MISMATCH',
  'UNREACHABLE',
  'LOST',
]

/* -------------------------------------------------------------------------- */
/*  Groupes de filtre (liste des demandes)                                    */
/* -------------------------------------------------------------------------- */

export interface LeadGroup {
  key: string
  label: string
  statuses: LeadStatus[]
}

export const LEAD_GROUPS: LeadGroup[] = [
  { key: 'a-traiter', label: 'À traiter', statuses: ['ESTIMATE_VIEWED', 'CALLBACK_REQUESTED'] },
  { key: 'a-completer', label: 'À compléter', statuses: ['INFO_INCOMPLETE', 'AWAITING_CLIENT'] },
  { key: 'visites', label: 'Visites', statuses: ['VISIT_TO_PLAN', 'APPOINTMENT_BOOKED', 'VISIT_DONE'] },
  { key: 'devis', label: 'Devis', statuses: ['QUOTE_SENT', 'QUOTE_FOLLOW_UP', 'CONTACTED'] },
  { key: 'gagnees', label: 'Gagnées', statuses: ['CONVERTED'] },
  {
    key: 'ecartees',
    label: 'Écartées',
    statuses: ['OUT_OF_ZONE', 'OUT_OF_SCOPE', 'BUDGET_MISMATCH', 'UNREACHABLE', 'LOST'],
  },
]

export function findGroup(key: string | undefined): LeadGroup | undefined {
  return LEAD_GROUPS.find((g) => g.key === key)
}

/* -------------------------------------------------------------------------- */
/*  Actions métier de la fiche lead                                           */
/* -------------------------------------------------------------------------- */

export interface LeadAction {
  status: LeadStatus
  label: string
  hint: string
  tone: 'blue' | 'amber' | 'indigo' | 'purple' | 'emerald'
}

/** Prochaines étapes proposées selon l'avancement de la demande. */
export const NEXT_ACTIONS: LeadAction[] = [
  {
    status: 'INFO_INCOMPLETE',
    label: 'Infos incomplètes : à recontacter',
    hint: 'Il manque des éléments pour chiffrer (équipement existant, accès, photos…).',
    tone: 'amber',
  },
  {
    status: 'AWAITING_CLIENT',
    label: 'Infos demandées : j’attends le client',
    hint: 'Le client doit répondre ou envoyer des éléments.',
    tone: 'amber',
  },
  {
    status: 'VISIT_TO_PLAN',
    label: 'Dossier complet : proposer une visite',
    hint: 'La demande est assez précise pour fixer une visite technique.',
    tone: 'indigo',
  },
  {
    status: 'APPOINTMENT_BOOKED',
    label: 'Visite planifiée',
    hint: 'Un créneau de visite est fixé avec le client.',
    tone: 'purple',
  },
  {
    status: 'VISIT_DONE',
    label: 'Visite effectuée : devis à établir',
    hint: 'La visite a eu lieu, il reste à envoyer le devis.',
    tone: 'purple',
  },
  {
    status: 'QUOTE_SENT',
    label: 'Devis envoyé',
    hint: 'Le devis est parti (avec ou sans visite, ex. entretien ou dépannage).',
    tone: 'blue',
  },
  {
    status: 'QUOTE_FOLLOW_UP',
    label: 'Devis à relancer',
    hint: 'Pas de réponse au devis : une relance est à faire.',
    tone: 'blue',
  },
  {
    status: 'CONVERTED',
    label: 'Devis accepté',
    hint: 'Le client a signé : la demande est gagnée.',
    tone: 'emerald',
  },
]

/** Motifs d'écartement (disqualification). */
export const DISQUALIFY_ACTIONS: { status: LeadStatus; label: string }[] = [
  { status: 'OUT_OF_ZONE', label: 'Hors zone d’intervention' },
  { status: 'OUT_OF_SCOPE', label: 'Hors prestations' },
  { status: 'BUDGET_MISMATCH', label: 'Budget incompatible' },
  { status: 'UNREACHABLE', label: 'Injoignable' },
  { status: 'LOST', label: 'Perdu (concurrent, abandon…)' },
]

export const ACTION_TONE_STYLES: Record<LeadAction['tone'], string> = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  amber: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
  purple: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
}

/* -------------------------------------------------------------------------- */
/*  Historique, source, montants                                              */
/* -------------------------------------------------------------------------- */

export const EVENT_LABELS: Record<EventType, string> = {
  ESTIMATE_VIEWED: 'Estimation consultée',
  QUOTE_EMAIL_SENT: 'Devis envoyé par e-mail',
  QUOTE_EMAIL_OPENED: 'E-mail de devis ouvert',
  CALLBACK_REQUESTED: 'Rappel demandé',
  APPOINTMENT_BOOKED: 'Rendez-vous pris',
  CONTACT_FORM_SUBMITTED: 'Formulaire de contact envoyé',
  PHONE_CLICKED: 'Clic sur le numéro de téléphone',
  STATUS_CHANGED: 'Statut modifié',
  NOTE: 'Note interne',
  FOLLOW_UP_SENT: 'Relance envoyée au client',
}

export const SOURCE_LABELS: Record<string, string> = {
  website: 'Site web',
  google: 'Google',
  facebook: 'Facebook',
  'bouche-a-oreille': 'Bouche-à-oreille',
}

export function formatEuroRange(min: number, max: number): string {
  return `${min.toLocaleString('fr-FR')} € – ${max.toLocaleString('fr-FR')} €`
}

/** Lit proprement le champ JSON `metadata` d'un événement. */
export function readMetadata(metadata: unknown): Record<string, unknown> {
  return metadata && typeof metadata === 'object' && !Array.isArray(metadata)
    ? (metadata as Record<string, unknown>)
    : {}
}
