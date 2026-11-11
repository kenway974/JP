import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computePerformance, firstActionDelayHours, formatDelay, median, type PerfLead } from './performance'

const NOW = new Date('2026-11-11T12:00:00Z')
const daysAgo = (d: number, extraHours = 0) => new Date(NOW.getTime() - d * 86400000 - extraHours * 3600000)

function lead(partial: Partial<PerfLead> & { ageDays: number }): PerfLead {
  const { ageDays, ...rest } = partial
  return {
    status: 'ESTIMATE_VIEWED',
    source: 'website',
    createdAt: daysAgo(ageDays),
    estimateMin: 1000,
    estimateMax: 2000,
    events: [],
    ...rest,
  }
}

test('volume : 30 derniers jours contre 30 jours précédents', () => {
  const stats = computePerformance(
    [lead({ ageDays: 2 }), lead({ ageDays: 10 }), lead({ ageDays: 29 }), lead({ ageDays: 31 }), lead({ ageDays: 45 }), lead({ ageDays: 70 })],
    NOW,
  )
  assert.equal(stats.leads30, 3)
  assert.equal(stats.leadsPrev30, 2)
  assert.equal(stats.evolutionPct, 50)
})

test('évolution nulle quand il n’y avait aucune demande avant', () => {
  assert.equal(computePerformance([lead({ ageDays: 3 })], NOW).evolutionPct, null)
})

test('conversion sur 90 jours, les demandes plus anciennes sont ignorées', () => {
  const stats = computePerformance(
    [
      lead({ ageDays: 5, status: 'CONVERTED' }),
      lead({ ageDays: 20 }),
      lead({ ageDays: 40, status: 'CONVERTED' }),
      lead({ ageDays: 60 }),
      lead({ ageDays: 120, status: 'CONVERTED' }),
    ],
    NOW,
  )
  assert.equal(stats.leads90, 4)
  assert.equal(stats.converted90, 2)
  assert.equal(stats.conversionPct, 50)
})

test('aucune demande : pas de taux inventé', () => {
  const stats = computePerformance([], NOW)
  assert.equal(stats.conversionPct, null)
  assert.equal(stats.medianFirstActionHours, null)
  assert.deepEqual(stats.pipeline, { count: 0, min: 0, max: 0 })
})

test('sources triées par volume, source absente regroupée', () => {
  const stats = computePerformance(
    [lead({ ageDays: 1, source: 'google' }), lead({ ageDays: 2, source: 'google' }), lead({ ageDays: 3, source: 'facebook' }), lead({ ageDays: 4, source: null })],
    NOW,
  )
  assert.deepEqual(stats.bySource, [
    { key: 'google', count: 2 },
    { key: 'facebook', count: 1 },
    { key: 'inconnue', count: 1 },
  ])
})

test('pipeline : somme des fourchettes des demandes encore ouvertes', () => {
  const stats = computePerformance(
    [
      lead({ ageDays: 2, status: 'QUOTE_SENT', estimateMin: 3000, estimateMax: 4000 }),
      lead({ ageDays: 3, status: 'VISIT_TO_PLAN', estimateMin: 500, estimateMax: 800 }),
      lead({ ageDays: 4, status: 'CONVERTED', estimateMin: 9000, estimateMax: 9500 }),
      lead({ ageDays: 5, status: 'LOST', estimateMin: 7000, estimateMax: 8000 }),
    ],
    NOW,
  )
  assert.deepEqual(stats.pipeline, { count: 2, min: 3500, max: 4800 })
})

test('première action : e-mail automatique ignoré, changement de statut ou note comptés', () => {
  const created = daysAgo(5)
  const l = lead({
    ageDays: 5,
    events: [
      { type: 'QUOTE_EMAIL_SENT', createdAt: new Date(created.getTime() + 60000) },
      { type: 'NOTE', createdAt: new Date(created.getTime() + 5 * 3600000) },
      { type: 'STATUS_CHANGED', createdAt: new Date(created.getTime() + 2 * 3600000) },
    ],
  })
  assert.equal(firstActionDelayHours(l), 2)
  assert.equal(firstActionDelayHours(lead({ ageDays: 5 })), null)
})

test('délai médian, calculé seulement sur les demandes déjà traitées', () => {
  const withDelay = (hours: number) =>
    lead({ ageDays: 4, events: [{ type: 'STATUS_CHANGED', createdAt: new Date(daysAgo(4).getTime() + hours * 3600000) }] })
  const stats = computePerformance([withDelay(1), withDelay(3), withDelay(10), lead({ ageDays: 2 })], NOW)
  assert.equal(stats.medianFirstActionHours, 3)
})

test('motifs d’abandon comptés par statut', () => {
  const stats = computePerformance(
    [lead({ ageDays: 3, status: 'OUT_OF_ZONE' }), lead({ ageDays: 4, status: 'OUT_OF_ZONE' }), lead({ ageDays: 5, status: 'BUDGET_MISMATCH' }), lead({ ageDays: 6 })],
    NOW,
  )
  assert.deepEqual(stats.discarded, [
    { key: 'OUT_OF_ZONE', count: 2 },
    { key: 'BUDGET_MISMATCH', count: 1 },
  ])
})

test('médiane et formatage du délai', () => {
  assert.equal(median([]), null)
  assert.equal(median([4, 1, 2, 3]), 2.5)
  assert.equal(formatDelay(null), '—')
  assert.equal(formatDelay(0.4), 'moins d’1 h')
  assert.equal(formatDelay(5.2), '5 h')
  assert.equal(formatDelay(24), '1 j')
  assert.equal(formatDelay(30), '1 j 6 h')
})
