import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth-helpers'
import { dayRangeLocal, parseISODateLocal } from '@/lib/date'

async function resolveDayRange(req: Request) {
  // 優先度: クエリパラメータ ?date=YYYY-MM-DD -> JSON ボディ { date }
  try {
    const url = new URL(req.url)
    const q = url.searchParams.get('date')?.trim()
    if (q) {
      const parsed = parseISODateLocal(q)
      if (parsed) return dayRangeLocal(parsed)
    }
  } catch {}
  try {
    const body: any = await req.clone().json().catch(() => null)
    if (body && typeof body.date === 'string') {
      const parsed = parseISODateLocal(body.date)
      if (parsed) return dayRangeLocal(parsed)
    }
  } catch {}
  return dayRangeLocal()
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { user, error } = await requireUser()
  if (error) return error
  const id = Number(params.id)
  if (!Number.isInteger(id)) return NextResponse.json({ message: 'invalid id' }, { status: 400 })

  const own = await prisma.routine.findFirst({ where: { id, userId: user!.id }, select: { id: true } })
  if (!own) return NextResponse.json({ message: 'not found' }, { status: 404 })

  const { start, end } = await resolveDayRange(req)
  const existing = await prisma.routineCheck.findFirst({ where: { routineId: id, date: { gte: start, lt: end } } })
  if (existing) {
    await prisma.routineCheck.delete({ where: { id: existing.id } })
    return NextResponse.json({ todayCompleted: false })
  } else {
    await prisma.routineCheck.create({ data: { routineId: id, date: start, completed: true } })
    return NextResponse.json({ todayCompleted: true })
  }
}
