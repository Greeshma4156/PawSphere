/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lavender: {
          DEFAULT: '#B79CFF',
          light: '#DCCFFF',
        },
        lilac: '#DCCFFF',
        mint: '#CDEEE1',
        peach: '#FFDCC8',
        beige: '#F8EEDF',
        cream: '#FFFDFB',
        dark: '#2B2B2B',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
