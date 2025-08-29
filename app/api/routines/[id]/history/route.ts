import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { toISODate } from '@/lib/date'

function startOfTodayLocal(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (!Number.isInteger(id)) return NextResponse.json({ message: 'invalid id' }, { status: 400 })

  const { searchParams } = new URL(req.url)
  const fromParam = searchParams.get('from') // YYYY-MM-DD (inclusive)
  const toParam = searchParams.get('to')     // YYYY-MM-DD (exclusive)

  let start: Date
  let endNext: Date
  let days: number | undefined

  if (fromParam && toParam) {
    const s = new Date(fromParam)
    const e = new Date(toParam)
    if (isNaN(s.getTime()) || isNaN(e.getTime()) || e <= s) {
      return NextResponse.json({ message: 'invalid range' }, { status: 400 })
    }
    start = new Date(s); start.setHours(0,0,0,0)
    endNext = new Date(e); endNext.setHours(0,0,0,0)
  } else {
    const daysParam = Number(searchParams.get('days') || '28')
    days = Number.isFinite(daysParam) ? Math.min(Math.max(daysParam, 7), 180) : 28
    const end = startOfTodayLocal()
    endNext = new Date(end)
    endNext.setDate(endNext.getDate() + 1)
    start = new Date(end)
    start.setDate(start.getDate() - (days - 1))
  }

  const rows = await prisma.routineCheck.findMany({
    where: { routineId: id, date: { gte: start, lt: endNext } },
    select: { date: true },
  })
  const set = new Set(rows.map(r => toISODate(r.date)))

  const out: Array<{ date: string; completed: boolean }> = []
  const cur = new Date(start)
  while (cur < endNext) {
    const key = toISODate(cur)
    out.push({ date: key, completed: set.has(key) })
    cur.setDate(cur.getDate() + 1)
  }

  return NextResponse.json({ days, history: out })
}
