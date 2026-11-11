import Link from 'next/link'
import { notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ArrowLeft, Phone, Mail, MapPin } from 'lucide-react'
import type { LeadStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_STYLES,
  SERVICE_SHORT_LABELS,
  HOUSING_SHORT_LABELS,
  BUILDING_AGE_SHORT_LABELS,
  URGENCY_LABELS,
  SPECIFICITY_LABELS,
  EVENT_LABELS,
  SOURCE_LABELS,
  label,
  isLeadStatus,
  formatEuroRange,
} from '@/lib/lead-labels'

const BOOKING_STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente de confirmation',
  CONFIRMED: 'Confirmé',
  CANCELLED: 'Annulé',
}

async function setStatus(id: string, status: LeadStatus) {
  'use server'
  if (!isLeadStatus(status)) return
  await prisma.lead.update({ where: { id }, data: { status } })
  revalidatePath('/admin')
  revalidatePath('/admin/leads')
  revalidatePath(`/admin/leads/${id}`)
}

async function setStatusFromForm(id: string, formData: FormData) {
  'use server'
  const status = formData.get('status')
  if (isLeadStatus(status)) await setStatus(id, status)
}

function Row({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2.5 border-b border-slate-50 last:border-0">
      <dt className="text-sm text-slate-500">{name}</dt>
      <dd className="text-sm font-medium text-slate-800 text-right">{children}</dd>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
      <h2 className="font-semibold text-slate-800 mb-3">{title}</h2>
      {children}
    </section>
  )
}

export default async function AdminLeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      events: { orderBy: { createdAt: 'desc' } },
      booking: { include: { slot: true } },
    },
  })

  if (!lead) notFound()

  const isLost = lead.status === 'LOST'
  const isConverted = lead.status === 'CONVERTED'

  return (
    <div className="max-w-5xl">
      <Link
        href="/admin/leads"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Retour aux demandes
      </Link>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{lead.firstName}</h1>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${LEAD_STATUS_STYLES[lead.status]}`}>
          {LEAD_STATUS_LABELS[lead.status]}
        </span>
        {lead.urgency === 'URGENT' && (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Urgence</span>
        )}
        <span className="text-sm text-slate-400">
          Demande reçue le {format(lead.createdAt, "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card title="Demande du client">
            <dl>
              <Row name="Prestation">{label(SERVICE_SHORT_LABELS, lead.serviceType)}</Row>
              <Row name="Type de logement">{label(HOUSING_SHORT_LABELS, lead.housingType)}</Row>
              <Row name="Surface concernée">{lead.surface ? `${lead.surface} m²` : '—'}</Row>
              <Row name="Âge du bâtiment">{label(BUILDING_AGE_SHORT_LABELS, lead.buildingAge)}</Row>
              <Row name="Urgence">{label(URGENCY_LABELS, lead.urgency)}</Row>
              <Row name="Estimation donnée au client">{formatEuroRange(lead.estimateMin, lead.estimateMax)}</Row>
            </dl>

            <div className="mt-4">
              <div className="text-sm text-slate-500 mb-2">Particularités signalées</div>
              {lead.specificities.length === 0 ? (
                <p className="text-sm text-slate-400">Aucune particularité cochée.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {lead.specificities.map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                      {label(SPECIFICITY_LABELS, s)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {lead.booking && (
            <Card title="Rendez-vous">
              <dl>
                <Row name="Créneau">
                  {format(lead.booking.slot.date, "EEEE dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                </Row>
                <Row name="Durée">{lead.booking.slot.duration} min</Row>
                <Row name="Statut">{BOOKING_STATUS_LABELS[lead.booking.status] ?? lead.booking.status}</Row>
              </dl>
              {lead.booking.notes && (
                <p className="mt-3 text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{lead.booking.notes}</p>
              )}
            </Card>
          )}

          <Card title="Historique">
            {lead.events.length === 0 ? (
              <p className="text-sm text-slate-400">Aucune action enregistrée pour cette demande.</p>
            ) : (
              <ul className="space-y-2">
                {lead.events.map((event) => (
                  <li key={event.id} className="flex justify-between gap-4 text-sm">
                    <span className="text-slate-700">{EVENT_LABELS[event.type] ?? event.type}</span>
                    <span className="text-slate-400 whitespace-nowrap">
                      {format(event.createdAt, 'dd/MM/yy HH:mm', { locale: fr })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Contact">
            <div className="space-y-3 text-sm">
              <a
                href={`tel:${lead.phone.replace(/\s/g, '')}`}
                className="flex items-center gap-2 text-slate-800 font-medium hover:text-brand-navy"
              >
                <Phone className="h-4 w-4 text-slate-400" /> {lead.phone}
              </a>
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="flex items-center gap-2 text-slate-700 hover:text-brand-navy break-all"
                >
                  <Mail className="h-4 w-4 text-slate-400 shrink-0" /> {lead.email}
                </a>
              )}
              <div className="flex items-center gap-2 text-slate-700">
                <MapPin className="h-4 w-4 text-slate-400" /> {lead.city}
              </div>
              <div className="text-xs text-slate-400 pt-1">
                Source : {lead.source ? (SOURCE_LABELS[lead.source] ?? lead.source) : '—'}
              </div>
            </div>
          </Card>

          <Card title="Qualification">
            <p className="text-xs text-slate-500 mb-3">
              Après avoir étudié la demande, indiquez si elle est à suivre ou à écarter.
            </p>
            <div className="flex flex-col gap-2">
              {lead.status !== 'CONTACTED' && !isConverted && !isLost && (
                <form action={setStatus.bind(null, lead.id, 'CONTACTED')}>
                  <button
                    type="submit"
                    className="w-full bg-cyan-50 text-cyan-700 border border-cyan-200 px-3 py-2 rounded-lg text-sm font-medium hover:bg-cyan-100"
                  >
                    Qualifier : client contacté
                  </button>
                </form>
              )}
              {!isConverted && (
                <form action={setStatus.bind(null, lead.id, 'CONVERTED')}>
                  <button
                    type="submit"
                    className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-100"
                  >
                    Marquer comme converti
                  </button>
                </form>
              )}
              {!isLost && (
                <form action={setStatus.bind(null, lead.id, 'LOST')}>
                  <button
                    type="submit"
                    className="w-full bg-red-50 text-red-700 border border-red-200 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100"
                  >
                    Disqualifier : demande perdue
                  </button>
                </form>
              )}
            </div>

            <form action={setStatusFromForm.bind(null, lead.id)} className="mt-4 pt-4 border-t border-slate-100">
              <label htmlFor="status" className="block text-xs text-slate-500 mb-1.5">
                Ou choisir un statut précis
              </label>
              <div className="flex gap-2">
                <select
                  id="status"
                  name="status"
                  defaultValue={lead.status}
                  className="flex-1 min-w-0 border border-slate-200 rounded-lg px-2 py-2 text-sm bg-white"
                >
                  {LEAD_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {LEAD_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="bg-slate-800 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-700"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
