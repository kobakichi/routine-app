"use client"

import { signIn, signOut, useSession } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'

export default function AuthButton() {
  const { status, data } = useSession()
  const isAuthed = status === 'authenticated'
  const name = data?.user?.name || data?.user?.email || 'User'
  const initials = (data?.user?.name || data?.user?.email || 'U')
    .split(' ')[0]
    .slice(0, 1)
    .toUpperCase()
  const image = (data?.user as any)?.image as string | undefined

  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [avatarError, setAvatarError] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined)
  const [editOpen, setEditOpen] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onDocKey(e: KeyboardEvent) { if (e.key === 'Escape') { setOpen(false); setEditOpen(false) } }
    if (open) {
      document.addEventListener('mousedown', onDocClick)
      document.addEventListener('keydown', onDocKey)
    }
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onDocKey)
    }
  }, [open])

  function onButtonKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen(true)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  function onMenuBlur(e: React.FocusEvent<HTMLDivElement>) {
    const next = e.relatedTarget as Node | null
    if (next && (menuRef.current?.contains(next) || ref.current?.contains(next))) return
    setOpen(false)
  }

  // DBに保存済みのアバターURLを取得（セッション画像より優先）
  useEffect(() => {
    let cancelled = false
    async function fetchAvatar() {
      try {
        const res = await fetch('/api/user/avatar', { cache: 'no-store' })
        if (!res.ok) return
        const json = await res.json()
        if (!cancelled) setAvatarUrl(json.image || undefined)
      } catch {}
    }
    if (isAuthed) fetchAvatar()
    return () => { cancelled = true }
  }, [isAuthed])

  if (status === 'loading') {
    return <div className="text-slate-500 text-sm">…</div>
  }

  if (!isAuthed) {
    return <button className="btn btn-primary" onClick={() => signIn('google')}>Googleでログイン</button>
  }

  async function saveAvatar() {
    setSaving(true)
    try {
      const body = { image: newUrl.trim() }
      const res = await fetch('/api/user/avatar', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) return
      const json = await res.json()
      setAvatarUrl(json.image || undefined)
      setAvatarError(false)
      setEditOpen(false)
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative z-20" ref={ref}>
      <button
        className="btn btn-ghost flex items-center gap-2"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="user-menu"
        onKeyDown={onButtonKeyDown}
        title={name}
      >
        <div className="relative h-7 w-7 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-medium">
          {(avatarUrl || image) && !avatarError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl || image!} alt="avatar" className="h-full w-full object-cover" onError={() => setAvatarError(true)} />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <span className="text-sm text-slate-700 dark:text-slate-200 hidden md:inline max-w-[12rem] truncate">
          {name}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 opacity-70">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.188l3.71-3.957a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0l-4.24-4.52a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>
      {open && (
        <div
          id="user-menu"
          ref={menuRef}
          className="absolute right-0 mt-2 w-48 card p-1 shadow-xl z-50"
          role="menu"
          aria-label="ユーザーメニュー"
          tabIndex={-1}
          onBlur={onMenuBlur}
        >
          <div className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 truncate" title={name}>{name}</div>
          <button className="btn btn-ghost w-full justify-start" onClick={() => setEditOpen(true)}>アバターを変更</button>
          <button className="btn btn-ghost w-full justify-start" onClick={() => signOut()}>ログアウト</button>
        </div>
      )}

      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setEditOpen(false)} />
          <div className="relative z-10 card w-[90%] max-w-md p-4">
            <h3 className="text-sm font-semibold mb-2">アバターURLを設定</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">画像のURL(https://)を入力。空欄でデフォルトに戻ります。</p>
            <input className="input mb-3" placeholder="https://example.com/avatar.png" value={newUrl} onChange={e => setNewUrl(e.target.value)} />
            <div className="flex items-center justify-end gap-2">
              <button className="btn btn-ghost" onClick={() => setEditOpen(false)}>キャンセル</button>
              <button className="btn btn-primary" disabled={saving} onClick={saveAvatar}>{saving ? '保存中…' : '保存'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
