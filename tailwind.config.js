/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
        ink: '#0F172A',
        canvas: '#FAFAFA',
        muted: '#64748B',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        display: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl2': '1.25rem',
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(15,23,42,0.04), 0 1px 2px rgba(15,23,42,0.06)',
        'card': '0 4px 14px rgba(15,23,42,0.06)',
      },
    },
  },
  plugins: [],
}
