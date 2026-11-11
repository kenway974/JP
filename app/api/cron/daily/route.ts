import { NextResponse } from 'next/server'
import { runDailyAutomations } from '@/lib/automations'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Passage quotidien (relances clients + récap), déclenché par Vercel Cron (voir vercel.json).
 * Vercel envoie `Authorization: Bearer <CRON_SECRET>` : sans cette variable, la route reste fermée.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET non configuré' }, { status: 503 })
  }
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const result = await runDailyAutomations()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('[cron/daily]', err)
    return NextResponse.json({ error: 'Échec du passage quotidien' }, { status: 500 })
  }
}
