import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Zap } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { findFollowUpCandidates, runFollowUps, sendDigest, KIND_LABELS } from '@/lib/automations'
import { loadFollowUpConfig } from '@/lib/follow-up-rules'
import { getDigestRecipient } from '@/lib/email'
import { readMetadata } from '@/lib/lead-labels'

export const dynamic = 'force-dynamic'

async function runDigestNow() {
  'use server'
  let outcome = 'recap-ok'
  try {
    await sendDigest({ force: true })
  } catch (err) {
    console.error('[recap manuel]', err)
    outcome = 'recap-erreur'
  }
  revalidatePath('/admin/automatisations')
  redirect(`/admin/automatisations?resultat=${outcome}`)
}

async function runFollowUpsNow() {
  'use server'
  let outcome: string
  try {
    const { results } = await runFollowUps()
    const sent = results.filter((r) => r.ok).length
    const failed = results.length - sent
    outcome = failed > 0 ? `relances-partiel-${sent}-${failed}` : `relances-${sent}`
  } catch (err) {
    console.error('[relances manuelles]', err)
    outcome = 'relances-erreur'
  }
  revalidatePath('/admin/automatisations')
  revalidatePath('/admin/leads')
  redirect(`/admin/automatisations?resultat=${outcome}`)
}

function describeResult(code: string | undefined): { text: string; ok: boolean } | null {
  if (!code) return null
  if (code === 'recap-ok') return { text: `Récap envoyé à ${getDigestRecipient()}.`, ok: true }
  if (code === 'recap-erreur') return { text: 'L’envoi du récap a échoué. Vérifiez la configuration e-mail.', ok: false }
  if (code === 'relances-erreur') return { text: 'Les relances ont échoué. Vérifiez la configuration e-mail.', ok: false }
  const partial = /^relances-partiel-(\d+)-(\d+)$/.exec(code)
  if (partial) return { text: `${partial[1]} relance(s) envoyée(s), ${partial[2]} en échec (nouvel essai au prochain passage).`, ok: false }
  const done = /^relances-(\d+)$/.exec(code)
  if (done) {
    const n = Number(done[1])
    return { text: n === 0 ? 'Aucune relance à envoyer pour le moment.' : `${n} relance(s) envoyée(s).`, ok: true }
  }
  return null
}

export default async function AutomationsPage({ searchParams }: { searchParams: Promise<{ resultat?: string }> }) {
  const { resultat } = await searchParams
  const config = loadFollowUpConfig()
  const [candidates, history] = await Promise.all([
    findFollowUpCandidates(),
    prisma.leadEvent.findMany({
      where: { type: 'FOLLOW_UP_SENT' },
      orderBy: { createdAt: 'desc' },
      take: 15,
      include: { lead: { select: { id: true, firstName: true } } },
    }),
  ])
  const result = describeResult(resultat)
  const cronReady = Boolean(process.env.CRON_SECRET)

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Zap className="h-6 w-6 text-orange-500" /> Automatisations
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Relances clients et récap quotidien, envoyés sans intervention du lundi au vendredi.
        </p>
      </div>

      {result && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            result.ok ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {result.text}
        </div>
      )}

      <section className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <h2 className="font-semibold text-slate-800 mb-3">Réglages en cours</h2>
        <dl className="grid sm:grid-cols-2 gap-x-8 text-sm">
          <Item name="Relance d’une estimation sans suite" value={`après ${config.estimationDelayDays} jours`} />
          <Item name="Relance d’un devis sans réponse" value={`après ${config.quoteDelayDays} jours`} />
          <Item name="Demandes plus anciennes que" value={`${config.maxAgeDays} jours : jamais relancées`} />
          <Item name="Plafond par passage" value={`${config.maxPerRun} e-mails`} />
          <Item name="Récap envoyé à" value={getDigestRecipient()} />
          <Item name="Passage automatique" value="du lundi au vendredi, vers 8 h (heure de Paris)" />
          <Item name="Relances automatiques" value={config.disabled ? 'désactivées' : 'activées'} />
          <Item name="Planificateur" value={cronReady ? 'prêt' : 'CRON_SECRET manquant sur Vercel'} />
        </dl>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="font-semibold text-slate-800">À relancer au prochain passage ({candidates.length})</h2>
          <div className="flex flex-wrap gap-2">
            <form action={runFollowUpsNow}>
              <button type="submit" className="bg-brand-navy text-white px-3 py-2 rounded-lg text-sm font-medium hover:opacity-90">
                Lancer les relances maintenant
              </button>
            </form>
            <form action={runDigestNow}>
              <button type="submit" className="bg-white text-slate-700 border border-slate-200 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
                Envoyer le récap maintenant
              </button>
            </form>
          </div>
        </div>
        {candidates.length === 0 ? (
          <p className="text-sm text-slate-400">Aucune demande à relancer pour le moment.</p>
        ) : (
          <ul className="divide-y divide-slate-50">
            {candidates.map((c) => (
              <li key={c.leadId} className="py-2.5 flex justify-between gap-4 text-sm">
                <Link href={`/admin/leads/${c.leadId}`} className="font-medium text-slate-800 hover:text-brand-navy">
                  {c.firstName}
                </Link>
                <span className="text-slate-500 text-right">
                  {KIND_LABELS[c.kind]} · depuis le {format(c.since, 'dd/MM/yy', { locale: fr })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <h2 className="font-semibold text-slate-800 mb-3">Dernières relances envoyées</h2>
        {history.length === 0 ? (
          <p className="text-sm text-slate-400">Aucune relance envoyée pour l’instant.</p>
        ) : (
          <ul className="divide-y divide-slate-50">
            {history.map((e) => {
              const meta = readMetadata(e.metadata)
              const kind = meta.kind === 'devis' ? 'devis' : 'estimation'
              return (
                <li key={e.id} className="py-2.5 flex justify-between gap-4 text-sm">
                  <Link href={`/admin/leads/${e.lead.id}`} className="font-medium text-slate-800 hover:text-brand-navy">
                    {e.lead.firstName}
                  </Link>
                  <span className="text-slate-500 text-right">
                    {KIND_LABELS[kind]} · {meta.manual ? 'manuelle' : 'automatique'} ·{' '}
                    {format(e.createdAt, 'dd/MM/yy HH:mm', { locale: fr })}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

function Item({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-slate-50">
      <dt className="text-slate-500">{name}</dt>
      <dd className="font-medium text-slate-800 text-right">{value}</dd>
    </div>
  )
}
