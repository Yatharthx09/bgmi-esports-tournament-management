/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Rajdhani"', '"Chakra Petch"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: {
          950: '#05070a',
          900: '#0a0e14',
          850: '#0d121a',
          800: '#111826',
          700: '#182231',
          600: '#243247',
        },
        neon: {
          green: '#39ff88',
          purple: '#a855f7',
          blue: '#38bdf8',
        },
      },
      boxShadow: {
        glow: '0 0 20px rgba(57, 255, 136, 0.25)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.25)',
        'glow-blue': '0 0 20px rgba(56, 189, 248, 0.25)',
      },
      backgroundImage: {
        'grid-pattern':
          'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
