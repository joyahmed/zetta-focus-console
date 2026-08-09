/** @type {import('tailwindcss').Config} */
export default {
	darkMode: 'class',
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				// Base structural colors. See the surface stack in index.css:
				// page, card, elevated (dialogs), panel (a block inside one),
				// inset (an editable field).
				// Every solid colour is `rgb(<channels> / <alpha-value>)` so
				// that `bg-zetta-bg/50` and `ring-zetta-neon/30` actually
				// compile — against a bare `var(--x)` Tailwind emits nothing at
				// all and the class silently does nothing. See index.css.
				// The translucent surfaces carry their own alpha and take no
				// modifier; there is a solid token for each of those cases.
				'zetta-bg': 'rgb(var(--bg-primary-rgb) / <alpha-value>)',
				'zetta-surface': 'rgb(var(--bg-secondary-rgb) / <alpha-value>)',
				'zetta-card': 'var(--bg-card)',
				'zetta-elevated': 'var(--bg-elevated)',
				'zetta-panel': 'var(--bg-panel)',
				'zetta-inset': 'var(--bg-inset)',
				'zetta-border': 'var(--border-color)',

				// Text colors
				'zetta-text': 'rgb(var(--text-primary-rgb) / <alpha-value>)',
				'zetta-text-secondary':
					'rgb(var(--text-secondary-rgb) / <alpha-value>)',
				'zetta-text-muted': 'rgb(var(--text-muted-rgb) / <alpha-value>)',

				// Accents
				'zetta-neon': 'rgb(var(--accent-neon-rgb) / <alpha-value>)',
				'zetta-neon-secondary':
					'rgb(var(--accent-neon-secondary-rgb) / <alpha-value>)',

				// Status. Tinted backgrounds stay on Tailwind's own red/green
				// at low alpha — these are the readable foreground per theme.
				'zetta-success': 'rgb(var(--color-success-rgb) / <alpha-value>)',
				'zetta-danger': 'rgb(var(--color-danger-rgb) / <alpha-value>)',
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
				'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
				// Theme-aware depth; both shift with the theme in index.css.
				'panel': 'var(--shadow-panel)',
				'elevated': 'var(--shadow-elevated)'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
			}
		}
	},
	plugins: []
};
