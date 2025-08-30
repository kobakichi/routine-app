import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth-helpers'

export async function GET() {
  const { user, error } = await requireUser()
  if (error) return error
  return NextResponse.json({ image: user!.image ?? null })
}

export async function PATCH(req: NextRequest) {
  const { user, error } = await requireUser()
  if (error) return error

  const body = await req.json().catch(() => ({} as any))
  let url = typeof body.image === 'string' ? body.image.trim() : ''

  if (!url) {
    await prisma.user.update({ where: { id: user!.id }, data: { image: null } })
    return NextResponse.json({ ok: true, image: null })
  }

  try {
    const u = new URL(url)
    if (!(u.protocol === 'http:' || u.protocol === 'https:')) throw new Error('invalid protocol')
  } catch {
    return NextResponse.json({ message: 'invalid image url' }, { status: 400 })
  }
  if (url.length > 2048) return NextResponse.json({ message: 'url too long' }, { status: 400 })

  await prisma.user.update({ where: { id: user!.id }, data: { image: url } })
  return NextResponse.json({ ok: true, image: url })
}

