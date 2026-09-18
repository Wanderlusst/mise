import type { Metadata, Viewport } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope',
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
    <html lang="en" className={`scroll-smooth ${manrope.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var s = localStorage.getItem('mise_user_settings_v1');
                if (s && JSON.parse(s).theme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-[#ece7e4] text-stone-900 dark:bg-[#1f1f1f] dark:text-stone-100 min-h-screen antialiased transition-colors duration-200">
        {children}
      </body>
    </html>
  )
}
