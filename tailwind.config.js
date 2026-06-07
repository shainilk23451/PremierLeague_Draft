/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#f5f0e8',
        'cream-dark': '#e8e2d4',
        pitch: '#1e5c2e',
        'pitch-light': '#2d7a40',
        'pl-purple': '#37003c',
        'pl-yellow': '#e8fa23',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
