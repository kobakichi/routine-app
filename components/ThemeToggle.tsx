"use client"

import { useEffect, useState } from 'react'

type Mode = 'light' | 'dark' | 'system'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<Mode>('system')

  const applyTheme = (mode: Mode) => {
    const root = document.documentElement
    const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    root.classList.toggle('dark', isDark)
  }

  useEffect(() => {
    setMounted(true)
    const saved = (localStorage.getItem('theme') as Mode) || 'system'
    setTheme(saved)
    // 初期適用（ThemeClient が未マウントでも反映されるように）
    applyTheme(saved)
  }, [])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem('theme', theme)
    applyTheme(theme)
  }, [theme, mounted])

  if (!mounted) return null
  return (
    <div className="glass rounded-md p-1 flex items-center gap-1">
      {(['light','system','dark'] as const).map(t => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          className={`btn btn-ghost ${theme===t ? 'ring-2 ring-blue-400/50' : ''}`}
          data-cursor="hover"
        >{t}</button>
      ))}
    </div>
  )
}
