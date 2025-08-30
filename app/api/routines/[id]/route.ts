import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth-helpers'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { user, error } = await requireUser()
  if (error) return error
  const id = Number(params.id)
  if (!Number.isInteger(id)) return NextResponse.json({ message: 'invalid id' }, { status: 400 })
  const own = await prisma.routine.findFirst({ where: { id, userId: user!.id }, select: { id: true } })
  if (!own) return NextResponse.json({ message: 'not found' }, { status: 404 })
  await prisma.routine.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, error } = await requireUser()
  if (error) return error
  const id = Number(params.id)
  if (!Number.isInteger(id)) return NextResponse.json({ message: 'invalid id' }, { status: 400 })
  const body = await req.json().catch(() => ({}))
  const data: { title?: string; color?: string } = {}
  if (typeof body.title === 'string' && body.title.trim()) data.title = body.title.trim()
  if (typeof body.color === 'string') data.color = body.color
  if (Object.keys(data).length === 0) return NextResponse.json({ message: 'no changes' }, { status: 400 })
  const own = await prisma.routine.findFirst({ where: { id, userId: user!.id }, select: { id: true } })
  if (!own) return NextResponse.json({ message: 'not found' }, { status: 404 })
  await prisma.routine.update({ where: { id }, data })
  return NextResponse.json({ ok: true })
}
