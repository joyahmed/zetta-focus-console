/** @type {import('tailwindcss').Config} */
export default {
	darkMode: 'class',
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				// Base structural colors
				'zetta-bg': 'var(--bg-primary)',
				'zetta-surface': 'var(--bg-secondary)',
				'zetta-card': 'var(--bg-card)',
				'zetta-panel': 'var(--bg-panel)',
				'zetta-border': 'var(--border-color)',

				// Text colors
				'zetta-text': 'var(--text-primary)',
				'zetta-text-secondary': 'var(--text-secondary)',
				'zetta-text-muted': 'var(--text-muted)',

				// Accents
				'zetta-neon': 'var(--accent-neon)',
				'zetta-neon-secondary': 'var(--accent-neon-secondary)',
			},
			fontFamily: {
				// Both families are bundled, so the fallbacks only matter if a
				// glyph is missing from the subset — not if the font fails to load.
				mono: ['JetBrains Mono', 'ui-monospace', 'Consolas', 'monospace'],
				sans: ['Inter', 'system-ui', 'sans-serif'],
			},
			boxShadow: {
				'neon': '0 0 10px rgba(139, 92, 246, 0.5), 0 0 20px rgba(139, 92, 246, 0.3)',
				'neon-cyan': '0 0 10px rgba(6, 182, 212, 0.5), 0 0 20px rgba(6, 182, 212, 0.3)',
				'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
			}
		}
	},
	plugins: []
};
