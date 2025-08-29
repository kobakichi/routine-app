"use client"

import { useEffect } from 'react'

type Mode = 'light' | 'dark' | 'system'

function applyTheme(mode: Mode) {
  const root = document.documentElement
  const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  root.classList.toggle('dark', isDark)
}

export default function ThemeClient() {
  useEffect(() => {
    const initial = (localStorage.getItem('theme') as Mode) || 'system'
    applyTheme(initial)

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      const cur = (localStorage.getItem('theme') as Mode) || 'system'
      if (cur === 'system') applyTheme('system')
    }
    mq.addEventListener?.('change', onChange)

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'theme') {
        const val = (e.newValue as Mode) || 'system'
        applyTheme(val)
      }
    }
    window.addEventListener('storage', onStorage)

    return () => {
      mq.removeEventListener?.('change', onChange)
      window.removeEventListener('storage', onStorage)
    }
  }, [])
  return null
}

