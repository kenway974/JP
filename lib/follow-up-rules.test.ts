import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  classifyQuoteLead,
  decideFollowUp,
  isPlaceholderEmail,
  loadFollowUpConfig,
  manualFollowUpKind,
  selectFollowUps,
  type FollowUpConfig,
  type RuleEvent,
  type RuleLead,
} from './follow-up-rules'

const DAY = 24 * 60 * 60 * 1000
const NOW = new Date('2026-11-20T08:00:00Z')
const daysAgo = (n: number) => new Date(NOW.getTime() - n * DAY)

const config: FollowUpConfig = {
  estimationDelayDays: 3,
  quoteDelayDays: 7,
  maxAgeDays: 21,
  maxPerRun: 20,
  disabled: false,
}

const estimateSent = (n: number): RuleEvent => ({ type: 'QUOTE_EMAIL_SENT', createdAt: daysAgo(n), metadata: {} })
const formalQuote = (n: number): RuleEvent => ({
  type: 'STATUS_CHANGED',
  createdAt: daysAgo(n),
  metadata: { from: 'VISIT_DONE', to: 'QUOTE_SENT' },
})
const followUp = (n: number, kind: string): RuleEvent => ({ type: 'FOLLOW_UP_SENT', createdAt: daysAgo(n), metadata: { kind } })

function lead(overrides: Partial<RuleLead> = {}): RuleLead {
  return {
    id: 'lead-1',
    status: 'QUOTE_SENT',
    email: 'client@gmail.com',
    createdAt: daysAgo(10),
    hasBooking: false,
    events: [estimateSent(4)],
    ...overrides,
  }
}

test('estimation sans suite depuis 3 jours : relance « estimation »', () => {
  const decision = decideFollowUp(lead(), NOW, config)
  assert.equal(decision?.kind, 'estimation')
})

test('estimation envoyée il y a moins de 3 jours : rien', () => {
  assert.equal(decideFollowUp(lead({ events: [estimateSent(2)] }), NOW, config), null)
})

test('devis formel : relance après 7 jours, pas avant', () => {
  const early = lead({ events: [estimateSent(12), formalQuote(6)] })
  const due = lead({ events: [estimateSent(12), formalQuote(8)] })
  assert.equal(decideFollowUp(early, NOW, config), null)
  assert.equal(decideFollowUp(due, NOW, config)?.kind, 'devis')
})

test('un devis formel plus récent que l’estimation prime sur l’estimation', () => {
  const l = lead({ events: [estimateSent(15), formalQuote(9)] })
  assert.equal(classifyQuoteLead(l)?.kind, 'devis')
})

test('une relance déjà envoyée n’est jamais renvoyée', () => {
  const l = lead({ events: [estimateSent(5), followUp(1, 'estimation')] })
  assert.equal(decideFollowUp(l, NOW, config), null)
})

test('une relance « estimation » n’empêche pas la relance « devis » qui suit', () => {
  const l = lead({ events: [estimateSent(14), followUp(10, 'estimation'), formalQuote(8)] })
  assert.equal(decideFollowUp(l, NOW, config)?.kind, 'devis')
})

test('adresses de démonstration ou sans e-mail : jamais de relance', () => {
  assert.equal(decideFollowUp(lead({ email: 'demo01@exemple.test' }), NOW, config), null)
  assert.equal(decideFollowUp(lead({ email: 'a@example.com' }), NOW, config), null)
  assert.equal(decideFollowUp(lead({ email: null }), NOW, config), null)
  assert.equal(isPlaceholderEmail('client@gmail.com'), false)
})

test('demande trop ancienne : jamais de relance', () => {
  assert.equal(decideFollowUp(lead({ createdAt: daysAgo(40), events: [estimateSent(38)] }), NOW, config), null)
})

test('rendez-vous déjà pris ou statut différent : rien', () => {
  assert.equal(decideFollowUp(lead({ hasBooking: true }), NOW, config), null)
  assert.equal(decideFollowUp(lead({ status: 'CONVERTED' }), NOW, config), null)
  assert.equal(decideFollowUp(lead({ status: 'QUOTE_FOLLOW_UP' }), NOW, config), null)
})

test('statut « Devis envoyé » sans aucun événement : rien (aucune preuve d’envoi)', () => {
  assert.equal(decideFollowUp(lead({ events: [] }), NOW, config), null)
})

test('interrupteur général', () => {
  assert.equal(decideFollowUp(lead(), NOW, { ...config, disabled: true }), null)
  assert.equal(loadFollowUpConfig({ AUTO_FOLLOW_UP_DISABLED: 'true' }).disabled, true)
  assert.equal(loadFollowUpConfig({}).disabled, false)
})

test('plafond par exécution : les plus anciennes d’abord', () => {
  const leads = [
    lead({ id: 'a', events: [estimateSent(4)] }),
    lead({ id: 'b', events: [estimateSent(9)] }),
    lead({ id: 'c', events: [estimateSent(6)] }),
  ]
  const picked = selectFollowUps(leads, NOW, { ...config, maxPerRun: 2 })
  assert.deepEqual(picked.map((p) => p.leadId), ['b', 'c'])
})

test('configuration : valeurs par défaut et valeurs invalides ignorées', () => {
  const c = loadFollowUpConfig({ FOLLOW_UP_ESTIMATE_DAYS: 'abc', FOLLOW_UP_QUOTE_DAYS: '10', FOLLOW_UP_MAX_AGE_DAYS: '0' })
  assert.equal(c.estimationDelayDays, 3)
  assert.equal(c.quoteDelayDays, 10)
  assert.equal(c.maxAgeDays, 21)
})

test('relance manuelle : le type suit la situation du lead', () => {
  assert.equal(manualFollowUpKind(lead({ events: [estimateSent(1), formalQuote(0)] })), 'devis')
  assert.equal(manualFollowUpKind(lead()), 'estimation')
  assert.equal(manualFollowUpKind(lead({ status: 'QUOTE_FOLLOW_UP', events: [] })), 'devis')
  assert.equal(manualFollowUpKind(lead({ status: 'ESTIMATE_VIEWED', events: [] })), 'estimation')
})
