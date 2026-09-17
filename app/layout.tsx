import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Mise — Cook smarter with what you have',
  description:
    'Tell Mise how much time you have or what ingredients are on hand, and it will find, adapt, and guide you through the perfect recipe.',
  keywords: ['recipe', 'cooking', 'meal planner', 'ingredient matcher', 'food'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Mise',
  },
}

export const viewport: Viewport = {
  themeColor: '#ece7e4',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#ece7e4] text-stone-900 min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
