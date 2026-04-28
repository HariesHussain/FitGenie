/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './App.tsx', './components/**/*.{ts,tsx}', './views/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Light mode
        background: '#f8fafc',
        surface: '#ffffff',
        surfaceHighlight: '#f1f5f9',
        primary: '#0ea5e9',
        primaryDark: '#0284c7',
        secondary: '#f59e0b',
        textMain: '#1e293b',
        textMuted: '#64748b',
        // Dark mode
        'dark-background': '#0f172a',
        'dark-surface': '#1e293b',
        'dark-surfaceHighlight': '#334155',
        'dark-primary': '#38bdf8',
        'dark-textMain': '#f1f5f9',
        'dark-textMuted': '#cbd5e1',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'float': '0 10px 30px -5px rgba(0, 0, 0, 0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
};
