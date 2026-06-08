/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Forest green — the FirstClub wordmark / primary button colour.
        brand: {
          50:  '#F0F6F1',
          100: '#DDEAE1',
          200: '#B8D2C0',
          300: '#8DB596',
          400: '#5F926A',
          500: '#3D7649',
          600: '#2D5E37',
          700: '#234A2D',
          800: '#1F4030',   // primary
          900: '#152C20',
        },
        // Warm cream — the page background and card surfaces.
        cream: {
          50:  '#FDFAF0',
          100: '#FAF3E0',   // page bg
          200: '#F4E5BF',   // card bg
          300: '#EBD391',
          400: '#DCBC5F',
        },
        ink:   '#1A1612',
        muted: '#6B6258',
      },
      fontFamily: {
        sans:    ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'Times New Roman', 'serif'],
      },
      borderRadius: {
        'xl2': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(31,64,48,0.05), 0 1px 2px rgba(31,64,48,0.06)',
        'card': '0 4px 14px rgba(31,64,48,0.06)',
      },
    },
  },
  plugins: [],
}
