/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        corporate: {
          950: '#070a10',
          900: '#0b0f17', // Main background shell (gentle dark obsidian)
          850: '#0f1420', // Secondary shell / headers
          800: '#151b28', // Cards / Panels surface
          750: '#1c2436', // Hover / elevated surface
          700: '#232d42', // Active border / subtle contrast
          600: '#334155', // Hairline borders
          500: '#475569', // Muted borders
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9', // Primary clean text
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8', // Secondary text
          500: '#64748b', // Muted text
          600: '#475569',
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          400: '#60a5fa',
          500: '#3b82f6', // Clean Corporate Blue Primary CTA
          600: '#2563eb',
          700: '#1d4ed8',
        },
        pill: {
          success: '#10b981', // Emerald
          warning: '#f59e0b', // Warm Amber
          danger: '#f43f5e',  // Gentle Rose
          primary: '#38bdf8', // Clean Sky / Blue
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderColor: {
        hairline: 'rgba(255, 255, 255, 0.08)',
        'hairline-light': 'rgba(255, 255, 255, 0.05)',
        'hairline-hover': 'rgba(56, 189, 248, 0.35)',
        'hairline-subtle': '#1e293b',
      },
      boxShadow: {
        'clean-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'clean-md': '0 4px 12px -2px rgba(0, 0, 0, 0.4)',
        'clean-lg': '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
        'clean-glow': '0 0 20px -2px rgba(59, 130, 246, 0.15)',
      }
    },
  },
  plugins: [],
}
