import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function requireUser() {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email
  if (!email) {
    return { error: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) as NextResponse }
  }
  const name = session.user?.name ?? null
  const oauthImage = (session.user as any)?.image as string | undefined

  // 既存ユーザーの画像は上書きしない（未設定のときだけOAuth画像を補完）
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    if (existing.name !== name || (!existing.image && oauthImage)) {
      const data: { name?: string | null; image?: string | null } = {}
      if (existing.name !== name) data.name = name
      if (!existing.image && oauthImage) data.image = oauthImage
      if (Object.keys(data).length) {
        const user = await prisma.user.update({ where: { id: existing.id }, data })
        return { user }
      }
    }
    return { user: existing }
  }
  const created = await prisma.user.create({ data: { email, name, image: oauthImage ?? null } })
  return { user: created }
}
