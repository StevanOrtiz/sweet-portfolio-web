/** @type {import('tailwindcss').Config} */
// Keep these hex values in sync with src/lib/palette.ts (used for inline styles with alpha suffixes).
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: '#0b0d10',
          panel: '#12151a',
          panel2: '#1a1e24',
          border: '#2a3038',
          text: '#e8ecf1',
          dim: '#8a94a3',
          accent: '#8cc8e8',
          select: '#172531',
          violet: '#b4bfcc',
          amber: '#d9b36a',
          mint: '#8cc8e8',
          rose: '#b4bfcc',
          ok: '#7fd4a0',
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
