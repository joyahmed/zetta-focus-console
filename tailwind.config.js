/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'zetta-bg': '#0f1115',
        'zetta-card': '#151821',
        'zetta-border': '#2a2f3a',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
