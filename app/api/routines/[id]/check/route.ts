import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth-helpers'

function todayRange() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { start, end }
}

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { user, error } = await requireUser()
  if (error) return error
  const id = Number(params.id)
  if (!Number.isInteger(id)) return NextResponse.json({ message: 'invalid id' }, { status: 400 })

  const own = await prisma.routine.findFirst({ where: { id, userId: user!.id }, select: { id: true } })
  if (!own) return NextResponse.json({ message: 'not found' }, { status: 404 })

  const { start, end } = todayRange()
  const existing = await prisma.routineCheck.findFirst({ where: { routineId: id, date: { gte: start, lt: end } } })
  if (existing) {
    await prisma.routineCheck.delete({ where: { id: existing.id } })
    return NextResponse.json({ todayCompleted: false })
  } else {
    await prisma.routineCheck.create({ data: { routineId: id, date: start, completed: true } })
    return NextResponse.json({ todayCompleted: true })
  }
}
