'use client'

import { useEffect, useMemo, useState } from 'react'
import { buttonGradientFor, ColorName } from '@/lib/colors'
import AuthButton from '@/components/AuthButton'

type Routine = {
  id: number
  title: string
  color: ColorName
  todayCompleted: boolean
  streak: number
}

export default function Page() {
  const [routines, setRoutines] = useState<Routine[]>([])
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)
  const [title, setTitle] = useState('')
  const [color, setColor] = useState<ColorName>('blue')
  const [busy, setBusy] = useState(false)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/routines', { cache: 'no-store' })
    if (res.status === 401) {
      setUnauthorized(true)
      setRoutines([])
      setLoading(false)
      return
    }
    if (!res.ok) {
      console.error('Failed to load /api/routines', res.status)
      setRoutines([])
      setLoading(false)
      return
    }
    let data: any
    try {
      data = await res.json()
    } catch (e) {
      console.error('Invalid JSON from /api/routines')
      setRoutines([])
      setLoading(false)
      return
    }
    setRoutines(Array.isArray(data?.routines) ? data.routines : [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const canSubmit = useMemo(() => title.trim().length > 0 && !busy, [title, busy])

  async function addRoutine() {
    if (!canSubmit) return
    setBusy(true)
    try {
      const res = await fetch('/api/routines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, color }),
      })
      if (res.status === 401) {
        setUnauthorized(true)
        return
      }
      if (!res.ok) {
        let message = '登録に失敗しました'
        try {
          const j = await res.json()
          if (typeof j?.message === 'string') message = j.message
        } catch {}
        alert(message)
        return
      }
      setTitle('')
      await load()
    } finally {
      setBusy(false)
    }
  }

  async function toggleToday(id: number) {
    const current = routines.find(r => r.id === id)
    if (!current) return
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, todayCompleted: !r.todayCompleted } : r))
    const res = await fetch(`/api/routines/${id}/check`, { method: 'POST' })
    if (!res.ok) {
      // revert on failure
      setRoutines(prev => prev.map(r => r.id === id ? { ...r, todayCompleted: current.todayCompleted } : r))
      return
    }
    await load()
  }

  async function removeRoutine(id: number) {
    const ok = confirm('このルーティーンを削除しますか？')
    if (!ok) return
    const prev = routines
    setRoutines(prev.filter(r => r.id !== id))
    const res = await fetch(`/api/routines/${id}`, { method: 'DELETE' })
    if (!res.ok) setRoutines(prev) // revert
  }

  function toggleExpand(id: number) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <main className="container py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight gradient-title">My Routine</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">1日のルーティーンをシンプルに管理</p>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <a href="/calendar" className="btn btn-ghost">カレンダー</a>
          <AuthButton />
        </div>
      </header>

      <section className="card mb-8">
        <h2 className="mb-3 text-sm font-semibold text-slate-600 dark:text-slate-300">ルーティーンを追加</h2>
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            className="input md:flex-1"
            placeholder="例: 朝のストレッチ"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) addRoutine() }}
          />
          <button
            className={`btn btn-primary ${buttonGradientFor(color)} text-white`}
            onClick={addRoutine}
            disabled={!canSubmit}
            title="クリックまたは Ctrl(⌘)+Enter で追加"
            aria-keyshortcuts="Control+Enter Meta+Enter"
          >追加</button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {unauthorized ? (
          <div className="text-slate-600 dark:text-slate-300 space-y-2">
            <p className="whitespace-nowrap">ルーティーンを表示するにはログインしてください。</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">右上のメニューからログインできます。</p>
          </div>
        ) : loading ? (
          <div className="text-slate-500">読み込み中...</div>
        ) : routines.length === 0 ? (
          <div className="text-slate-500">まだルーティーンがありません。上で追加してみましょう。</div>
        ) : (
          routines.map(r => (
            <article
              key={r.id}
              className={`card overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl flex items-center justify-between gap-3`}
            >
              <div className="min-w-0 flex-1">
                <h3
                  onClick={() => toggleExpand(r.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpand(r.id) } }}
                  role="button"
                  tabIndex={0}
                  aria-expanded={expanded.has(r.id)}
                  title={expanded.has(r.id) ? 'クリックで折りたたむ' : 'クリックで全文表示'}
                  className={`text-lg font-semibold cursor-pointer ${expanded.has(r.id) ? 'whitespace-normal break-words' : 'truncate'}`}
                >
                  {r.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">連続 {r.streak} 日</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  className={`btn flex items-center gap-2 btn-ghost ring-1 ring-${r.color}-400 text-slate-700 dark:text-slate-200`}
                  onClick={() => toggleToday(r.id)}
                  aria-pressed={r.todayCompleted}
                  aria-label={r.todayCompleted ? '今日の完了を解除' : '完了にする'}
                  title={r.todayCompleted ? '今日の完了を解除' : '完了にする'}
                >
                  {r.todayCompleted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 opacity-80">
                      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-2.59a.75.75 0 1 0-1.06-1.06l-4.72 4.72-1.94-1.94a.75.75 0 1 0-1.06 1.06l2.47 2.47c.293.293.767.293 1.06 0l5.25-5.25Z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4">
                      <circle cx="12" cy="12" r="9" strokeWidth="2" />
                      <path d="M8 12l2.5 2.5L16 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"/>
                    </svg>
                  )}
                  <span className="text-sm font-medium">
                    {r.todayCompleted ? '完了を解除' : '完了にする'}
                  </span>
                </button>
                <button className="btn btn-ghost" onClick={() => removeRoutine(r.id)} title="ルーティーンを削除">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4">
                    <path d="M3 6h18" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M8 6v-.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V6" strokeWidth="2"/>
                    <path d="M6 6l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" strokeWidth="2"/>
                    <path d="M10 11v6M14 11v6" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span className="sr-only">削除</span>
                  削除
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  )
}

function HistoryGrid({ id, color }: { id: number; color: ColorName }) {
  const [data, setData] = useState<{ date: string; completed: boolean }[] | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      try {
        // 週頭揃えのため、最大で+1週間分を余分に取得して安全にカバー
        const res = await fetch(`/api/routines/${id}/history?days=35`, { cache: 'no-store' })
        const json = await res.json()
        if (!cancelled) setData(json.history as { date: string; completed: boolean }[])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [id])

  if (loading || !data) return <div className="text-xs text-slate-500">履歴読み込み中...</div>

  // 日付セットへ変換
  const set = new Set(data.map(d => `${d.date}:${d.completed ? 1 : 0}`))
  const hasDone = (iso: string) => set.has(`${iso}:1`)

  // 直近4週間を週頭(日曜)揃えで描画
  const today = new Date(); today.setHours(0,0,0,0)
  const startBase = new Date(today)
  startBase.setDate(startBase.getDate() - 21) // 3週間前
  const dow = startBase.getDay() // 0=Sun
  const startAligned = new Date(startBase)
  startAligned.setDate(startAligned.getDate() - dow) // 週頭(日曜)へ

  const doneCls = `bg-${color}-500`
  const emptyCls = 'bg-slate-200 dark:bg-slate-700'
  const futureCls = 'bg-slate-100 dark:bg-slate-800 opacity-50'

  const weeksCount = 4
  const rows = 7

  return (
    <div className="space-y-1">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">直近4週間（週頭: 日曜）</div>
      <div className="flex gap-1">
        {Array.from({ length: weeksCount }).map((_, col) => (
          <div key={col} className="grid grid-rows-7 gap-1">
            {Array.from({ length: rows }).map((__, row) => {
              const d = new Date(startAligned)
              d.setDate(d.getDate() + col * 7 + row)
              const iso = `${d.getFullYear()}-${`${d.getMonth()+1}`.padStart(2,'0')}-${`${d.getDate()}`.padStart(2,'0')}`
              const isFuture = d > today
              const completed = !isFuture && hasDone(iso)
              return (
                <div
                  key={iso}
                  className={`h-3.5 w-3.5 rounded-[3px] ${completed ? doneCls : (isFuture ? futureCls : emptyCls)}`}
                  title={`${iso} ${completed ? '✓' : ''}`}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// ThemeToggle は共通コンポーネントを利用
