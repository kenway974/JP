import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BASE_PRICE_DEFAULTS, FACTOR_DEFAULTS, FACTOR_LABELS } from '@/lib/estimation-config'
import type { ServiceType } from '@/lib/estimation'

export async function GET() {
  try {
    const [baseRows, factorRows] = await Promise.all([
      prisma.estimationBasePrice.findMany(),
      prisma.estimationFactor.findMany(),
    ])

    const baseByService = new Map(baseRows.map((r) => [r.serviceType, r]))
    const basePrices = (Object.keys(BASE_PRICE_DEFAULTS) as ServiceType[]).map((serviceType) => {
      const row = baseByService.get(serviceType)
      const defaults = BASE_PRICE_DEFAULTS[serviceType]
      return {
        serviceType,
        label: defaults.label,
        min: row?.min ?? defaults.min,
        max: row?.max ?? defaults.max,
      }
    })

    const factorByKey = new Map(factorRows.map((r) => [r.key, r]))
    const factors = Object.keys(FACTOR_DEFAULTS).map((key) => {
      const row = factorByKey.get(key)
      const defaults = FACTOR_DEFAULTS[key]
      return {
        key,
        label: FACTOR_LABELS[key] || key,
        minMultiplier: row?.minMultiplier ?? defaults.minMultiplier,
        maxMultiplier: row?.maxMultiplier ?? defaults.maxMultiplier,
        active: row?.active ?? true,
      }
    })

    return NextResponse.json({ basePrices, factors })
  } catch (err) {
    console.error('GET /api/admin/estimation', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const basePrices: { serviceType: ServiceType; min: number; max: number }[] = body.basePrices || []
    const factors: { key: string; minMultiplier: number; maxMultiplier: number; active: boolean }[] = body.factors || []

    await prisma.$transaction([
      ...basePrices.map((b) =>
        prisma.estimationBasePrice.upsert({
          where: { serviceType: b.serviceType },
          create: { serviceType: b.serviceType, min: b.min, max: b.max },
          update: { min: b.min, max: b.max },
        })
      ),
      ...factors.map((f) =>
        prisma.estimationFactor.upsert({
          where: { key: f.key },
          create: { key: f.key, minMultiplier: f.minMultiplier, maxMultiplier: f.maxMultiplier, active: f.active },
          update: { minMultiplier: f.minMultiplier, maxMultiplier: f.maxMultiplier, active: f.active },
        })
      ),
    ])

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('PATCH /api/admin/estimation', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
