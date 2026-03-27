'use server'

import { prisma } from '@/shared/lib/prisma'
import { getServerSession } from '@/shared/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const session = await getServerSession()
  if (!session || session.role !== 'ADMIN') redirect('/')
  return session
}

export async function getPublishedArticles(category?: string) {
  return prisma.insightArticle.findMany({
    where: {
      published: true,
      ...(category && category !== 'all' ? { category } : {}),
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      preview: true,
      category: true,
      readTime: true,
      createdAt: true,
      author: { select: { name: true } },
    },
  })
}

export async function getAllArticlesAdmin() {
  await requireAdmin()
  return prisma.insightArticle.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { name: true } } },
  })
}

export async function getArticleForEdit(id: string) {
  await requireAdmin()
  return prisma.insightArticle.findUnique({ where: { id } })
}

export async function createArticle(formData: FormData) {
  const admin = await requireAdmin()

  const title    = (formData.get('title')    as string)?.trim()
  const preview  = (formData.get('preview')  as string)?.trim()
  const content  = (formData.get('content')  as string)?.trim()
  const category = (formData.get('category') as string) || 'general'
  const readTime = parseInt(formData.get('readTime') as string) || 5
  const published = formData.get('published') === 'true'

  if (!title || !preview || !content) {
    return { error: 'Заполните все обязательные поля' }
  }

  await prisma.insightArticle.create({
    data: { title, preview, content, category, readTime, published, authorId: admin.id },
  })

  revalidatePath('/insights')
  redirect('/admin/news')
}

export async function updateArticle(id: string, formData: FormData) {
  await requireAdmin()

  const title    = (formData.get('title')    as string)?.trim()
  const preview  = (formData.get('preview')  as string)?.trim()
  const content  = (formData.get('content')  as string)?.trim()
  const category = (formData.get('category') as string) || 'general'
  const readTime = parseInt(formData.get('readTime') as string) || 5
  const published = formData.get('published') === 'true'

  if (!title || !preview || !content) {
    return { error: 'Заполните все обязательные поля' }
  }

  await prisma.insightArticle.update({
    where: { id },
    data: { title, preview, content, category, readTime, published },
  })

  revalidatePath('/insights')
  revalidatePath(`/insights/${id}`)
  redirect('/admin/news')
}

export async function deleteArticle(id: string) {
  await requireAdmin()
  await prisma.insightArticle.delete({ where: { id } })
  revalidatePath('/insights')
  revalidatePath('/admin/news')
}

export async function togglePublish(id: string, published: boolean) {
  await requireAdmin()
  await prisma.insightArticle.update({ where: { id }, data: { published } })
  revalidatePath('/insights')
  revalidatePath('/admin/news')
}
