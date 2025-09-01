export function startOfTodayLocal(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${d}`
}

// YYYY-MM-DD をローカルタイムの Date(その日の00:00) として解釈
export function parseISODateLocal(key: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key)
  if (!m) return null
  const year = Number(m[1])
  const month = Number(m[2])
  const day = Number(m[3])
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null
  const d = new Date(year, month - 1, day)
  d.setHours(0, 0, 0, 0)
  return d
}

// 指定日のローカル日付の始端/終端(翌日始端)を返す
export function dayRangeLocal(date?: Date): { start: Date; end: Date } {
  const start = date ? new Date(date) : new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { start, end }
}
