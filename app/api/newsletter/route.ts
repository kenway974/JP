import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getOffer } from '@/lib/newsletter/offers'
import { sendOfferGuide } from '@/lib/email'

// Un même email ne reçoit pas plus d'un guide par jour : bloque l'envoi en boucle vers une adresse
const COOLDOWN_MS = 24 * 60 * 60 * 1000

const SubscribeSchema = z.object({
  email: z.string().trim().email().max(200),
  offer: z.string().max(100),
  // Consentement explicite : la case doit être cochée côté client
  consent: z.literal(true),
  // Champ piège caché dans le formulaire : un humain ne le remplit jamais
  website: z.string().max(200).optional().default(''),
})

export async function POST(req: NextRequest) {
  let data: z.infer<typeof SubscribeSchema>
  try {
    data = SubscribeSchema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }

  // Robot détecté : réponse identique à un succès, rien n'est envoyé
  if (data.website) return NextResponse.json({ ok: true })

  const offer = getOffer(data.offer)
  if (!offer) return NextResponse.json({ error: 'Offre inconnue' }, { status: 400 })

  const email = data.email.toLowerCase()

  try {
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } })
    const recentlySent = !!existing?.lastSentAt && Date.now() - existing.lastSentAt.getTime() < COOLDOWN_MS

    // Réponse identique que l'adresse existe ou non : on ne révèle pas qui est déjà inscrit
    if (!recentlySent) {
      await sendOfferGuide({ to: email, offer })
      const now = new Date()
      await prisma.newsletterSubscriber.upsert({
        where: { email },
        create: { email, offer: offer.id, consentAt: now, lastSentAt: now },
        update: { offer: offer.id, consentAt: now, lastSentAt: now },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[newsletter]', err)
    return NextResponse.json({ error: "Impossible d'envoyer le guide pour le moment." }, { status: 500 })
  }
}
