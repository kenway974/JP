import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { createSessionToken, AUTH_COOKIE_NAME } from '@/lib/auth'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH

  if (!adminEmail || !adminPasswordHash) {
    return NextResponse.json({ error: 'Authentification admin non configurée (ADMIN_EMAIL / ADMIN_PASSWORD_HASH manquants).' }, { status: 500 })
  }

  const body = await req.json().catch(() => null)
  const parsed = LoginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Email ou mot de passe invalide.' }, { status: 400 })
  }

  const { email, password } = parsed.data

  const emailMatches = email.toLowerCase() === adminEmail.toLowerCase()
  const passwordMatches = await bcrypt.compare(password, adminPasswordHash)

  if (!emailMatches || !passwordMatches) {
    return NextResponse.json({ error: 'Identifiants incorrects.' }, { status: 401 })
  }

  const token = await createSessionToken(adminEmail)
  const res = NextResponse.json({ ok: true })
  res.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  return res
}
