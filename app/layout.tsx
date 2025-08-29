import './globals.css'
import { ReactNode } from 'react'
import { Plus_Jakarta_Sans } from 'next/font/google'
import dynamic from 'next/dynamic'
import ThemeClient from '@/components/ThemeClient'
const ThreeBackground = dynamic(() => import('@/components/ThreeBackground'), { ssr: false })

export const metadata = {
  title: 'Routine App',
  description: '1日のルーティーン管理アプリ',
}

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-display',
  display: 'swap',
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${jakarta.variable} font-sans antialiased`}> 
        <div className="relative min-h-screen">
          <ThemeClient />
          <ThreeBackground />
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
