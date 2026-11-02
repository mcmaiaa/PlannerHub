/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        plum: {
          bg: '#16131D',
          card: '#211C2B',
          hover: '#292336',
          border: '#322B40',
          text: '#F5F2F8',
          muted: '#A89FBD',
        },
        pastel: {
          lavender: '#C4B5FD',
          pink: '#F9A8D4',
          mint: '#86EFAC',
          coral: '#FDA4AF',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
