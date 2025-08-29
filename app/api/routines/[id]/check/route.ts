import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function todayRange() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { start, end }
}

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (!Number.isInteger(id)) return NextResponse.json({ message: 'invalid id' }, { status: 400 })

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

