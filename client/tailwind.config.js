/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forge: {
          50: '#eef2ff',
          500: '#6366f1',
          600: '#4f46e5',
          950: '#151022'
        }
      },
      boxShadow: {
        glow: '0 0 60px rgba(99, 102, 241, 0.25)'
      }
    }
  },
  plugins: []
};
