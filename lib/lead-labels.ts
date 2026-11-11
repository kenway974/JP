import type { LeadStatus, EventType } from '@prisma/client'
import { WIZARD_STEPS } from '@/components/wizard/questions'

/**
 * Libellés français des leads, utilisés par le back-office.
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

/** Ordre du parcours : de l'arrivée du lead jusqu'à la conclusion. */
export const LEAD_STATUSES: LeadStatus[] = [
  'ESTIMATE_VIEWED',
  'CALLBACK_REQUESTED',
  'APPOINTMENT_BOOKED',
  'QUOTE_SENT',
  'CONTACTED',
  'CONVERTED',
  'LOST',
]

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  ESTIMATE_VIEWED: 'Estimation vue',
  CALLBACK_REQUESTED: 'Rappel demandé',
  APPOINTMENT_BOOKED: 'RDV pris',
  QUOTE_SENT: 'Devis envoyé',
  CONTACTED: 'Contacté',
  CONVERTED: 'Converti',
  LOST: 'Perdu',
}

export const LEAD_STATUS_STYLES: Record<LeadStatus, string> = {
  ESTIMATE_VIEWED: 'bg-slate-100 text-slate-600',
  CALLBACK_REQUESTED: 'bg-orange-100 text-orange-700',
  APPOINTMENT_BOOKED: 'bg-purple-100 text-purple-700',
  QUOTE_SENT: 'bg-blue-100 text-blue-700',
  CONTACTED: 'bg-cyan-100 text-cyan-700',
  CONVERTED: 'bg-emerald-100 text-emerald-700',
  LOST: 'bg-red-100 text-red-700',
}

export function isLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === 'string' && (LEAD_STATUSES as string[]).includes(value)
}

export const EVENT_LABELS: Record<EventType, string> = {
  ESTIMATE_VIEWED: 'Estimation consultée',
  QUOTE_EMAIL_SENT: 'Devis envoyé par e-mail',
  QUOTE_EMAIL_OPENED: 'E-mail de devis ouvert',
  CALLBACK_REQUESTED: 'Rappel demandé',
  APPOINTMENT_BOOKED: 'Rendez-vous pris',
  CONTACT_FORM_SUBMITTED: 'Formulaire de contact envoyé',
  PHONE_CLICKED: 'Clic sur le numéro de téléphone',
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
