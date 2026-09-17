import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette
        olive: {
          900: '#2A3318',
          800: '#3E4A2A',
          700: '#4A5830',
          600: '#5C6B3D',
          500: '#6E7F4A',
          400: '#8A9B64',
          300: '#A8B882',
          200: '#C8D4A8',
          100: '#E4ECD0',
          50:  '#F2F6E8',
        },
        saffron: {
          600: '#B8842A',
          500: '#C9942E',
          400: '#D9A441',
          300: '#E8BC6A',
          200: '#F0D09A',
          100: '#FAF0D8',
        },
        cream: {
          100: '#FFFDF8',
          200: '#FAF6EE',
          300: '#F7F3EA',
          400: '#F0EBE0',
        },
        glass: {
          white: 'rgba(255,253,248,0.92)',
          dark:  'rgba(62,74,42,0.75)',
        },
      },
      fontFamily: {
        sans: [
          '"SF Pro Display"',
          '"SF Pro Text"',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'var(--font-inter)',
          'Inter',
          'sans-serif',
        ],
        serif: [
          '-apple-system-ui-serif',
          'ui-serif',
          '"New York"',
          'Georgia',
          'Cambria',
          'serif',
        ],
        mono: [
          'ui-monospace',
          '"SF Mono"',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      fontSize: {
        'hero': ['40px', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],
        'hero-sm': ['32px', { lineHeight: '1.15', fontWeight: '700', letterSpacing: '-0.02em' }],
        'display': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
        'title': ['22px', { lineHeight: '1.3', fontWeight: '600' }],
        'label-lg': ['15px', { lineHeight: '1.4', fontWeight: '500' }],
        'label': ['13px', { lineHeight: '1.4', fontWeight: '500' }],
        'label-sm': ['11px', { lineHeight: '1.4', fontWeight: '500' }],
        'stat': ['22px', { lineHeight: '1', fontWeight: '600' }],
        'stat-sm': ['16px', { lineHeight: '1', fontWeight: '600' }],
      },
      borderRadius: {
        'glass': '24px',
        'pill': '999px',
        'chip': '12px',
      },
      backdropBlur: {
        'glass': '20px',
        'heavy': '40px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(62,74,42,0.08), 0 2px 8px rgba(62,74,42,0.06), inset 0 0 0 1px rgba(255,255,255,0.6)',
        'glass-sm': '0 4px 16px rgba(62,74,42,0.06), inset 0 0 0 1px rgba(255,255,255,0.5)',
        'glass-heavy': '0 16px 48px rgba(62,74,42,0.12), inset 0 0 0 1px rgba(255,255,255,0.5)',
        'nav': '0 -4px 32px rgba(62,74,42,0.08), 0 -1px 0 rgba(255,255,255,0.6)',
        'center-btn': '0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.15)',
        'card': '0 2px 16px rgba(62,74,42,0.07), 0 1px 4px rgba(62,74,42,0.04)',
      },
      maxWidth: {
        'mobile': '430px',
      },
      height: {
        'nav': '72px',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
}
export default config
