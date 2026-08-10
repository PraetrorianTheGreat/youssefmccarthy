/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#07090e',
        card: 'rgba(18, 22, 31, 0.65)',
        accent: {
          purple: '#8b5cf6',
          cyan: '#06b6d4',
          pink: '#ec4899',
        },
        borderGlow: 'rgba(139, 92, 246, 0.25)',
        textPrimary: '#f8fafc',
        textMuted: '#94a3b8',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
        'radial-glow': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
