import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'ui-sans-serif', 'system-ui',
          'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', 'Yu Gothic', 'Meiryo',
          'Segoe UI', 'Roboto', 'Arial', 'sans-serif'
        ],
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui'],
      },
      keyframes: {
        aurora1: {
          '0%':   { transform: 'translate(-20%, -14%) rotate(-8deg) scale(1.05)' },
          '100%': { transform: 'translate(18%, 12%) rotate(8deg) scale(1.2)' },
        },
        aurora2: {
          '0%':   { transform: 'translate(16%, 12%) rotate(6deg) scale(1.05)' },
          '100%': { transform: 'translate(-16%, -12%) rotate(-6deg) scale(1.18)' },
        },
        aurora3: {
          '0%':   { transform: 'translate(12%, -10%) rotate(-10deg) scale(1.08)' },
          '100%': { transform: 'translate(-12%, 10%) rotate(10deg) scale(1.2)' },
        },
      },
      animation: {
        aurora1: 'aurora1 16s ease-in-out infinite alternate',
        aurora2: 'aurora2 20s ease-in-out infinite alternate',
        aurora3: 'aurora3 24s ease-in-out infinite alternate',
      },
      container: {
        center: true,
        padding: '1rem',
        screens: {
          '2xl': '1200px',
        },
      },
      boxShadow: {
        glass: '0 8px 30px rgba(0,0,0,0.12)'
      }
    },
  },
  safelist: [
    { pattern: /(bg|from|to)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(100|200|300|400|500|600|700|800|900)/ },
    { pattern: /text-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(200|300|400|500|600|700)/ },
    { pattern: /ring-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(300|400|500|600)/ },
  ],
  plugins: [],
}

export default config
