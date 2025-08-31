'use client'

import { useEffect, useMemo, useState } from 'react'
// テーマ切替はプロフィール内に移動
import AuthButton from '@/components/AuthButton'

type RoutineLite = { id: number; title: string; color: string }

function startOfMonth(d: Date) { const x = new Date(d); x.setDate(1); x.setHours(0,0,0,0); return x }
function endOfMonth(d: Date) { const x = new Date(d); x.setMonth(x.getMonth()+1,1); x.setHours(0,0,0,0); return x }
function toISO(date: Date) { const y=date.getFullYear(); const m=String(date.getMonth()+1).padStart(2,'0'); const d=String(date.getDate()).padStart(2,'0'); return `${y}-${m}-${d}` }

export default function CalendarPage() {
  const [routines, setRoutines] = useState<RoutineLite[]>([])
  const [rid, setRid] = useState<number|undefined>(undefined)
  const [month, setMonth] = useState(() => { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d })
  const [history, setHistory] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [unauthorized, setUnauthorized] = useState(false)

  useEffect(() => {
    async function loadRoutines() {
      const res = await fetch('/api/routines', { cache: 'no-store' })
      if (res.status === 401) { setUnauthorized(true); return }
      if (!res.ok) { console.error('Failed to load routines'); return }
      let json: any
      try { json = await res.json() } catch { console.error('Invalid JSON for routines'); return }
      const list = Array.isArray(json.routines) ? (json.routines as any[]).map(r => ({ id: r.id, title: r.title, color: r.color })) : []
      setRoutines(list)
      if (list.length && rid == null) setRid(list[0].id)
    }
    loadRoutines()
  }, [])

  useEffect(() => {
    async function loadHistory() {
      if (!rid) return
      setLoading(true)
      try {
        const from = toISO(startOfMonth(month))
        const to = toISO(endOfMonth(month))
        const res = await fetch(`/api/routines/${rid}/history?from=${from}&to=${to}`, { cache: 'no-store' })
        if (!res.ok) return
        let json: any
        try { json = await res.json() } catch { return }
        const map: Record<string, boolean> = {}
        for (const h of (json.history as { date: string; completed: boolean }[]) || []) map[h.date] = h.completed
        setHistory(map)
      } finally {
        setLoading(false)
      }
    }
    loadHistory()
  }, [rid, month])

  const days = useMemo(() => buildMonthGrid(month), [month])
  const currentColor = routines.find(r => r.id === rid)?.color || 'blue'

  return (
    <main className="container py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-display font-semibold whitespace-nowrap">カレンダー</h1>
        <div className="flex items-center gap-2 whitespace-nowrap ml-auto">
          <a href="/" className="btn btn-ghost">戻る</a>
          <AuthButton />
        </div>
      </header>

      {unauthorized ? (
        <div className="card mb-4">
          <p className="text-slate-600 dark:text-slate-300 whitespace-nowrap">カレンダーを表示するにはログインしてください。</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">右上のメニューからログインできます。</p>
        </div>
      ) : (
      <div className="card mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 sm:gap-3 whitespace-nowrap">
          <button className="btn btn-ghost" onClick={() => setMonth(prev => addMonths(prev, -1))}>{'←'}</button>
          <div className="text-lg font-medium whitespace-nowrap">{monthLabel(month)}</div>
          <button className="btn btn-ghost" onClick={() => setMonth(prev => addMonths(prev, 1))}>{'→'}</button>
          <button className="btn btn-ghost" onClick={() => setMonth(new Date())}>今月</button>
        </div>
        <div>
          <select className="input" value={rid ?? ''} onChange={e => setRid(Number(e.target.value))}>
            {routines.map(r => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
        </div>
      </div>
      )}

      {!unauthorized && (
        <section className="card">
          <WeekHeader />
          {loading ? (
            <div className="text-slate-500">読み込み中...</div>
          ) : (
            <MonthGrid days={days} history={history} color={currentColor} month={month} />
          )}
        </section>
      )}
    </main>
  )
}

function WeekHeader() {
  const labels = ['日','月','火','水','木','金','土']
  return (
    <div className="grid grid-cols-7 gap-1 mb-2 text-[11px] text-slate-500 dark:text-slate-400">
      {labels.map(l => <div key={l} className="text-center">{l}</div>)}
    </div>
  )
}

function MonthGrid({ days, history, color, month }: { days: Date[]; history: Record<string, boolean>; color: string; month: Date }) {
  const doneCls = `bg-${color}-500`
  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map(d => {
        const iso = toISO(d)
        const inMonth = d.getMonth() === month.getMonth()
        const isToday = isSameDay(d, new Date())
        const completed = !!history[iso]
        const base = inMonth ? (completed ? doneCls : 'bg-slate-200 dark:bg-slate-700') : 'bg-slate-100 dark:bg-slate-800'
        return (
          <div key={iso} className={`relative h-10 rounded-md ${base} flex items-center justify-center text-[11px] select-none`}
               title={`${iso} ${completed ? '✓' : ''}`}>
            <span className={`${inMonth ? '' : 'opacity-50'} ${isToday ? 'ring-2 ring-blue-400/50 dark:ring-blue-500/50 rounded-md px-1' : ''}`}>{d.getDate()}</span>
          </div>
        )
      })}
    </div>
  )
}

function buildMonthGrid(month: Date): Date[] {
  const start = startOfMonth(month)
  const end = endOfMonth(month)
  const firstDow = start.getDay() // Sun=0
  const gridStart = new Date(start)
  gridStart.setDate(start.getDate() - firstDow)
  const days: Date[] = []
  // 6 weeks to cover any month (42 cells)
  for (let i=0;i<42;i++) { const d = new Date(gridStart); d.setDate(gridStart.getDate()+i); days.push(d) }
  return days
}

function addMonths(d: Date, diff: number) { const x = new Date(d); x.setMonth(x.getMonth()+diff, 1); return x }
function monthLabel(d: Date) { return `${d.getFullYear()}年 ${d.getMonth()+1}月` }
function isSameDay(a: Date, b: Date) { return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate() }
