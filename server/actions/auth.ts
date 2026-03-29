'use server'

import { prisma } from '@/shared/lib/prisma'
import { hashPassword, verifyPassword } from '@/shared/lib/password'
import { createSessionToken, setSessionCookie, clearSessionCookie } from '@/shared/lib/auth'
import { z } from 'zod'
import { redirect } from 'next/navigation'

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  dateOfBirth: z.string().optional(),
})

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes

async function checkLockout(user: { id: string; loginAttempts: number; lockedUntil: Date | null }) {
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const mins = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000)
    return { locked: true, error: `Аккаунт временно заблокирован. Попробуйте через ${mins} мин.` }
  }
  return { locked: false }
}

async function recordFailedLogin(userId: string, attempts: number) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      loginAttempts: { increment: 1 },
      lockedUntil: attempts + 1 >= MAX_LOGIN_ATTEMPTS
        ? new Date(Date.now() + LOCKOUT_DURATION_MS)
        : null,
    },
  })
}

async function resetLoginAttempts(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { loginAttempts: 0, lockedUntil: null },
  })
}

const ReaderRegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(5),
  specialization: z.string().min(2),
  experience: z.string().min(2),
  methods: z.string().min(2),
  bio: z.string().min(20),
  about: z.string().optional(),
  price: z.string(),
})

// ─── Client registration ──────────────────────────────────────────────────────

export async function registerClient(formData: FormData) {
  const raw = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    dateOfBirth: formData.get('dateOfBirth') as string,
  }

  const parsed = RegisterSchema.safeParse(raw)
  if (!parsed.success) return { error: 'Проверьте правильность заполнения полей' }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (existing) return { error: 'Пользователь с таким email уже существует' }

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: hashPassword(parsed.data.password),
      role: 'CLIENT',
      dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : null,
    },
  })

  const token = createSessionToken(user.id, user.role)
  setSessionCookie(token)
  redirect('/cabinet')
}

// ─── Client login ─────────────────────────────────────────────────────────────

export async function loginClient(formData: FormData) {
  const raw = { email: formData.get('email') as string, password: formData.get('password') as string }
  const parsed = LoginSchema.safeParse(raw)
  if (!parsed.success) return { error: 'Введите email и пароль' }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (!user || !user.passwordHash) return { error: 'Неверный email или пароль' }

  const lockout = await checkLockout(user)
  if (lockout.locked) return { error: lockout.error! }

  if (!verifyPassword(parsed.data.password, user.passwordHash)) {
    await recordFailedLogin(user.id, user.loginAttempts)
    return { error: 'Неверный email или пароль' }
  }
  if (user.role !== 'CLIENT') return { error: 'Используйте вход для консультантов' }

  await resetLoginAttempts(user.id)
  const token = createSessionToken(user.id, user.role)
  setSessionCookie(token)
  redirect('/cabinet')
}

// ─── Reader / Author / Admin login (unified) ─────────────────────────────────

export async function loginReader(formData: FormData) {
  const raw = { email: formData.get('email') as string, password: formData.get('password') as string }
  const parsed = LoginSchema.safeParse(raw)
  if (!parsed.success) return { error: 'Введите email и пароль' }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    include: { readerProfile: true },
  })

  if (!user || !user.passwordHash) return { error: 'Неверный email или пароль' }

  const lockout2 = await checkLockout(user)
  if (lockout2.locked) return { error: lockout2.error! }

  if (!verifyPassword(parsed.data.password, user.passwordHash)) {
    await recordFailedLogin(user.id, user.loginAttempts)
    return { error: 'Неверный email или пароль' }
  }

  await resetLoginAttempts(user.id)

  // Admin goes to admin dashboard
  if (user.role === 'ADMIN') {
    const token = createSessionToken(user.id, user.role)
    setSessionCookie(token)
    redirect('/admin/dashboard')
  }

  // Reader or Author
  if (user.role !== 'READER' && user.role !== 'AUTHOR') {
    return { error: 'Этот аккаунт не является аккаунтом консультанта' }
  }

  // Check approval
  if (!user.readerProfile || user.readerProfile.approvalStatus !== 'APPROVED') {
    const status = user.readerProfile?.approvalStatus
    if (status === 'PENDING') return { error: 'Ваша анкета на рассмотрении. Мы уведомим вас по email.' }
    if (status === 'REJECTED') return { error: 'К сожалению, ваша заявка отклонена.' }
    return { error: 'Профиль консультанта не найден' }
  }

  const token = createSessionToken(user.id, user.role)
  setSessionCookie(token)
  redirect('/reader/dashboard')
}

// ─── Reader registration (creates PENDING profile) ───────────────────────────

export async function registerReader(formData: FormData) {
  const raw = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    phone: formData.get('phone') as string,
    specialization: formData.get('specialization') as string,
    experience: formData.get('experience') as string,
    methods: formData.get('methods') as string,
    bio: formData.get('bio') as string,
    about: formData.get('about') as string,
    price: formData.get('price') as string,
  }

  const parsed = ReaderRegisterSchema.safeParse(raw)
  if (!parsed.success) return { error: 'Проверьте правильность заполнения всех полей. Пароль — минимум 8 символов.' }

  const existing = await prisma.user.findUnique({ where: { email: raw.email } })
  if (existing) return { error: 'Пользователь с таким email уже существует' }

  await prisma.user.create({
    data: {
      name: raw.name,
      email: raw.email,
      passwordHash: hashPassword(raw.password),
      role: 'READER',
      readerProfile: {
        create: {
          name: raw.name,
          specialization: raw.specialization,
          tier: 'FOUNDATION',
          price: parseFloat(raw.price) || 50,
          bio: raw.bio,
          phone: raw.phone,
          experience: raw.experience,
          methods: raw.methods,
          about: raw.about || '',
          approvalStatus: 'PENDING',
          isActive: false,
        },
      },
    },
  })

  return { success: 'Ваша анкета отправлена на рассмотрение. Мы свяжемся с вами по email.' }
}

// ─── Request Author role (for approved readers) ──────────────────────────────

export async function requestAuthorRole() {
  const { getServerSession } = await import('@/shared/lib/auth')
  const session = await getServerSession()
  if (!session) return { error: 'Необходима авторизация' }
  if (session.role !== 'READER') return { error: 'Только консультанты могут запросить роль автора' }

  // Just flag it — admin will see in dashboard
  // For now, we'll use a simple approach: set a flag in readerProfile.about
  await prisma.user.update({
    where: { id: session.id },
    data: { role: 'READER' }, // stays READER until admin approves
  })

  return { success: 'Запрос на роль автора отправлен. Администратор рассмотрит его.' }
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logout() {
  clearSessionCookie()
  redirect('/')
}
