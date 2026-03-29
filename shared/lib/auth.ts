import { cookies } from 'next/headers'
import { prisma } from './prisma'
import jwt from 'jsonwebtoken'

const SESSION_COOKIE = 'lumier_session'
const SESSION_DURATION = 30 * 24 * 60 * 60 // 30 days in seconds

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set')
  return secret
}

// ─── Token creation (JWT signed) ──────────────────────────────────────────────

export function createSessionToken(userId: string, role: string): string {
  return jwt.sign(
    { userId, role },
    getJwtSecret(),
    { expiresIn: SESSION_DURATION },
  )
}

// ─── Token parsing (verified) ─────────────────────────────────────────────────

export function parseSessionToken(token: string): { userId: string; role: string } | null {
  try {
    const payload = jwt.verify(token, getJwtSecret()) as { userId: string; role: string }
    return payload
  } catch {
    return null
  }
}

// ─── Get full session from DB ─────────────────────────────────────────────────

export async function getServerSession() {
  const cookieStore = cookies()
  const raw = cookieStore.get(SESSION_COOKIE)?.value
  if (!raw) return null

  const parsed = parseSessionToken(raw)
  if (!parsed) return null

  const user = await prisma.user.findUnique({
    where: { id: parsed.userId },
    include: { readerProfile: true },
  })

  if (!user) return null
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    readerProfile: user.readerProfile,
  }
}

// ─── Cookie management ────────────────────────────────────────────────────────

export function setSessionCookie(token: string) {
  const cookieStore = cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  })
}

export function clearSessionCookie() {
  const cookieStore = cookies()
  cookieStore.delete(SESSION_COOKIE)
}
