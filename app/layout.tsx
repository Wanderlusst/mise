import type { Metadata, Viewport } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'
import { JsonLd } from '@/components/seo/JsonLd'
import { AppProviders } from '@/components/providers/AppProviders'

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mise-cookbook.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Mise — Cook Smarter With What You Have',
    template: '%s | Mise',
  },
  description:
    'Cook smarter with what you have. AI-powered pantry scanner, instant zero-waste recipe matching, conversational Sous-Chef, and real-time step-by-step cooking guide.',
  keywords: [
    'AI recipe generator',
    'pantry scanner',
    'what can I cook',
    'ingredient matcher',
    'zero food waste cooking',
    'smart meal planner',
    'step by step cooking',
    'sous-chef AI',
    'recipe assistant',
  ],
  authors: [{ name: 'Mise Culinary AI Team' }],
  creator: 'Mise',
  publisher: 'Mise',
  applicationName: 'Mise',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '48x48' },
    ],
    shortcut: '/icon.svg',
    apple: [{ url: '/icon.svg', sizes: '180x180', type: 'image/svg+xml' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Mise',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Mise Cookbook',
    title: 'Mise — Cook Smarter With What You Have',
    description:
      'Transform available ingredients into chef-crafted meals. AI pantry vision, zero-waste recipe matching, and hands-free guided cooking.',
    images: [
      {
        url: '/food/pasta.jpg',
        width: 1200,
        height: 630,
        alt: 'Mise AI Cookbook and Pantry Assistant',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mise — Cook Smarter With What You Have',
    description:
      'Transform available ingredients into chef-crafted meals. AI pantry vision, zero-waste recipe matching, and hands-free guided cooking.',
    images: ['/food/pasta.jpg'],
    creator: '@misecookbook',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#211E19' },
    { media: '(prefers-color-scheme: light)', color: '#F7F2E9' },
  ],
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
    <html lang="en" className={manrope.variable} suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <JsonLd />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var s = localStorage.getItem('mise_user_settings_v1');
                  var t = s ? JSON.parse(s).theme : null;
                  var isDark = t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  var bg = isDark ? '#211E19' : '#F7F2E9';
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                  document.documentElement.style.backgroundColor = bg;
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-[var(--bg-page)] text-[var(--text-primary)] min-h-screen antialiased">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  )
}
