import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import HeaderWrapper from '@/components/HeaderWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Nexus Blog',
  description: 'AI 기반 차세대 개발 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='ko'>
      <body className={inter.className}>
        <HeaderWrapper />
        <main>{children}</main>
      </body>
    </html>
  )
}
