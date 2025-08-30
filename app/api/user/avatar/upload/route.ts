import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import path from 'path'
import fs from 'fs/promises'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const { user, error } = await requireUser()
  if (error) return error

  const form = await req.formData().catch(() => null)
  if (!form) return NextResponse.json({ message: 'invalid form' }, { status: 400 })
  const file = form.get('file') as unknown as File | null
  if (!file) return NextResponse.json({ message: 'file is required' }, { status: 400 })

  const max = 5 * 1024 * 1024 // 5MB
  const size = (file as any).size as number | undefined
  if (!size || size <= 0) return NextResponse.json({ message: 'empty file' }, { status: 400 })
  if (size > max) return NextResponse.json({ message: 'file too large (<=5MB)' }, { status: 413 })

  const mime = (file as any).type as string | undefined
  const allowed = new Set(['image/jpeg','image/png','image/webp','image/gif'])
  if (!mime || !allowed.has(mime)) {
    return NextResponse.json({ message: 'unsupported file type' }, { status: 400 })
  }

  const name = (file as any).name as string | undefined
  const extFromName = name && name.includes('.') ? name.split('.').pop()!.toLowerCase() : undefined
  const extFromMime = mime.split('/').pop()
  const ext = (extFromName || extFromMime || 'png').replace(/[^a-z0-9]/g, '')

  const buf = Buffer.from(await file.arrayBuffer())
  const dir = path.join(process.cwd(), 'public', 'uploads', 'avatars', String(user!.id))
  await fs.mkdir(dir, { recursive: true })
  const fname = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`
  const absPath = path.join(dir, fname)
  await fs.writeFile(absPath, buf)

  // 以前のローカルファイルを削除（/uploads/avatars/... の場合のみ）
  const existing = user!.image
  if (existing && existing.startsWith('/uploads/avatars/')) {
    try {
      const oldAbs = path.join(process.cwd(), 'public', existing)
      await fs.unlink(oldAbs)
    } catch {}
  }

  const publicPath = `/uploads/avatars/${user!.id}/${fname}`
  await prisma.user.update({ where: { id: user!.id }, data: { image: publicPath } })

  return NextResponse.json({ ok: true, image: publicPath })
}

