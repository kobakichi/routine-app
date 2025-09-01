import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth-helpers'
import { toISODate } from '@/lib/date'
import { dayRangeLocal, parseISODateLocal } from '@/lib/date'

function parseTodayRangeFromReq(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('date')?.trim()
  if (key) {
    const d = parseISODateLocal(key)
    if (d) return dayRangeLocal(d)
  }
  return dayRangeLocal()
}

export async function GET(req: NextRequest) {
  const { user, error } = await requireUser()
  if (error) return error

  const routines = await prisma.routine.findMany({
    where: { userId: user!.id },
    orderBy: { id: 'asc' },
  })

  const ids = routines.map(r => r.id)
  const { start, end } = parseTodayRangeFromReq(req)
  const checks = ids.length > 0 ? await prisma.routineCheck.findMany({
    where: { routineId: { in: ids }, date: { gte: start, lt: end } },
    select: { routineId: true },
  }) : []
  const checked = new Set(checks.map(c => c.routineId))

  // 連続日数(streak)の計算用に過去N日分を取得して集計
  const windowDays = 180
  const from = new Date(start)
  from.setDate(from.getDate() - windowDays)
  const history = ids.length > 0 ? await prisma.routineCheck.findMany({
    where: { routineId: { in: ids }, date: { gte: from, lt: end } },
    select: { routineId: true, date: true },
    orderBy: { date: 'desc' },
  }) : []
  const map = new Map<number, Set<string>>()
  for (const h of history) {
    const key = toISODate(h.date)
    const s = map.get(h.routineId) || new Set<string>()
    s.add(key)
    map.set(h.routineId, s)
  }

  const todayKey = toISODate(start)
  const y = new Date(start)
  y.setDate(y.getDate() - 1)
  const yKey = toISODate(y)

  function calcStreak(routineId: number): number {
    const set = map.get(routineId) || new Set<string>()
    let curKey = checked.has(routineId) ? todayKey : yKey
    let count = 0
    let cursor = new Date(curKey)
    while (set.has(toISODate(cursor))) {
      count += 1
      cursor.setDate(cursor.getDate() - 1)
    }
    return count
  }

  return NextResponse.json({
    routines: routines.map(r => ({ id: r.id, title: r.title, color: r.color, todayCompleted: checked.has(r.id), streak: calcStreak(r.id) })),
  })
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireUser()
  if (error) return error

  const body = await req.json().catch(() => ({}))
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const color = typeof body.color === 'string' ? body.color : 'blue'
  if (!title) return NextResponse.json({ message: 'title is required' }, { status: 400 })

  // 簡易バリデーション（Tailwindのセーフリストと合わせる）
  const allowed = new Set([
    'slate','gray','zinc','neutral','stone','red','orange','amber','yellow','lime','green','emerald','teal','cyan','sky','blue','indigo','violet','purple','fuchsia','pink','rose'
  ])
  const c = allowed.has(color) ? color : 'blue'

  const created = await prisma.routine.create({ data: { title, color: c, userId: user!.id } })
  return NextResponse.json({ id: created.id })
}
