import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const { user, error } = await requireUser()
  if (error) return error

  const form = await req.formData().catch(() => null)
  if (!form) return NextResponse.json({ message: 'invalid form' }, { status: 400 })
  const file = form.get('file') as unknown as File | null
  if (!file) return NextResponse.json({ message: 'file is required' }, { status: 400 })

  // Vercelのサーバレス制限回避のため 4MB に制限
  const max = 4 * 1024 * 1024 // 4MB
  const size = (file as any).size as number | undefined
  if (!size || size <= 0) return NextResponse.json({ message: 'empty file' }, { status: 400 })
  if (size > max) return NextResponse.json({ message: 'file too large (<=5MB)' }, { status: 413 })

  const mime = (file as any).type as string | undefined
  const allowed = new Set(['image/jpeg','image/png','image/webp','image/gif'])
  if (!mime || !allowed.has(mime)) {
    return NextResponse.json({ message: 'unsupported file type' }, { status: 400 })
  }

  // Supabase Storage (public bucket) へのアップロード
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE
  const bucket = process.env.SUPABASE_BUCKET || 'avatars'
  if (!supabaseUrl || !supabaseServiceRole) {
    return NextResponse.json({ message: 'supabase env is not configured' }, { status: 500 })
  }

  const buf = Buffer.from(await file.arrayBuffer())
  const name = (file as any).name as string | undefined
  const extFromName = name && name.includes('.') ? name.split('.').pop()!.toLowerCase() : undefined
  const extFromMime = mime.split('/').pop()
  const ext = (extFromName || extFromMime || 'png').replace(/[^a-z0-9]/g, '')
  const fname = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`
  const objectPath = `${user!.id}/${fname}`

  const uploadUrl = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/${encodeURIComponent(bucket)}/${objectPath}`
  const resUp = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseServiceRole}`,
      'apikey': supabaseServiceRole,
      'Content-Type': mime,
      'x-upsert': 'true',
    },
    body: buf,
  })

  if (!resUp.ok) {
    let msg = `storage upload failed (status ${resUp.status})`
    try { const j = await resUp.json(); if (j?.message) msg = j.message } catch {}
    return NextResponse.json({ message: msg }, { status: 502 })
  }

  // 公開バケット前提の公開URL
  const publicUrl = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${encodeURIComponent(bucket)}/${objectPath}`
  await prisma.user.update({ where: { id: user!.id }, data: { image: publicUrl } })
  return NextResponse.json({ ok: true, image: publicUrl })
}
