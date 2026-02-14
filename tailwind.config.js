/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'zetta-bg': 'var(--bg-primary)',
        'zetta-card': 'var(--bg-card)',
        'zetta-border': 'var(--border-color)',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'monospace'],
      },
      backgroundColor: {
        'primary': 'var(--bg-primary)',
        'secondary': 'var(--bg-secondary)',
      },
    },
  },
  plugins: [],
}
