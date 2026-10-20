/** @type {import('tailwindcss').Config} */
// Keep these hex values in sync with src/lib/palette.ts (used for inline styles with alpha suffixes).
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: '#1a1530',
          panel: '#231c3d',
          panel2: '#2d2450',
          border: '#43386b',
          text: '#f6e9d8',
          dim: '#a99bc4',
          accent: '#ff6b57',
          select: '#4a2a5c',
          violet: '#b78ad9',
          amber: '#f3c677',
          mint: '#4cc3bd',
          rose: '#ff8fa3',
          ok: '#8fd694',
        },
      },
      fontFamily: {
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
