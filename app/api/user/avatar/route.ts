import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth-helpers'

export async function GET() {
  const { user, error } = await requireUser()
  if (error) return error
  return NextResponse.json({ image: user!.image ?? null })
}
