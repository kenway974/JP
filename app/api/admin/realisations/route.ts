import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const RealisationSchema = z.object({
  slug: z.string().min(3).max(100),
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  serviceType: z.enum(['CHAUFFAGE', 'CLIMATISATION', 'VMC', 'PLOMBERIE', 'ELECTRICITE', 'ENTRETIEN', 'RENOVATION']),
  city: z.string().max(100).optional().nullable(),
  imageUrl: z.string().url().max(500).optional().nullable().or(z.literal('')),
  imageAlt: z.string().max(200).optional().nullable(),
  published: z.boolean().default(true),
})

export async function GET() {
  const realisations = await prisma.realisation.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ realisations })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = RealisationSchema.parse(body)
    const realisation = await prisma.realisation.create({
      data: { ...data, imageUrl: data.imageUrl || null, completedAt: new Date() },
    })
    return NextResponse.json({ realisation }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...rest } = body
    const data = RealisationSchema.partial().parse(rest)
    const realisation = await prisma.realisation.update({
      where: { id },
      data: { ...data, imageUrl: data.imageUrl || null },
    })
    return NextResponse.json({ realisation })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    await prisma.realisation.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
