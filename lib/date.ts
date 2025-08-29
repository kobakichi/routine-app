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

