/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,vue}"],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          "'Segoe UI'",
          "'Noto Sans'",
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        soft: '0 2px 12px rgba(0, 0, 0, 0.06)',
        card: '0 4px 20px rgba(34, 197, 94, 0.08)',
      },
    },
  },
  plugins: [],
};
