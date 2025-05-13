/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        primary: '#1a56db',
        secondary: '#7c3aed',
        success: '#059669',
        danger: '#dc2626',
        warning: '#d97706',
        info: '#3b82f6',
      },
    },
  },
  plugins: [],
} 