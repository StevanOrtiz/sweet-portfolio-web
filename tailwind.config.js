/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: '#1b1b1d',
          panel: '#232326',
          panel2: '#2b2b2f',
          border: '#3a3a40',
          text: '#d8d8dc',
          dim: '#8d8d96',
          accent: '#0d99ff',
          violet: '#a66bff',
          amber: '#ffb02e',
          mint: '#2ee6a6',
          rose: '#ff5d8f',
          select: '#0b5a99',
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
