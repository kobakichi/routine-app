import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (!Number.isInteger(id)) return NextResponse.json({ message: 'invalid id' }, { status: 400 })
  await prisma.routine.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (!Number.isInteger(id)) return NextResponse.json({ message: 'invalid id' }, { status: 400 })
  const body = await req.json().catch(() => ({}))
  const data: { title?: string; color?: string } = {}
  if (typeof body.title === 'string' && body.title.trim()) data.title = body.title.trim()
  if (typeof body.color === 'string') data.color = body.color
  if (Object.keys(data).length === 0) return NextResponse.json({ message: 'no changes' }, { status: 400 })
  await prisma.routine.update({ where: { id }, data })
  return NextResponse.json({ ok: true })
}

