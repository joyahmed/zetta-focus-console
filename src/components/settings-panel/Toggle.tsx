/**
 * The switch.
 *
 * This was the last place in the app threading an `isLight` prop by hand, to
 * pick between `bg-gray-300` and `bg-gray-600` for the track and between `#666`
 * and white for the thumb. None of that needs to be a prop: the theme is a set
 * of CSS variables on the root element, and `zetta-inset` and `zetta-text` both
 * already move with it. A switch that reads the theme itself cannot be told the
 * wrong one.
 */
const Toggle = ({ enabled, onChange, disabled = false }: ToggleProps) => (
	<button
		type='button'
		role='switch'
		aria-checked={enabled}
		onClick={onChange}
		disabled={disabled}
		className={`relative w-11 h-6 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zetta-neon/60 ${
			disabled ? 'opacity-50 cursor-not-allowed' : ''
		} ${enabled ? 'bg-zetta-info' : 'bg-zetta-inset border border-zetta-border'}`}
	>
		<span
			className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform ${
				enabled
					? 'translate-x-5 bg-white'
					: 'translate-x-0 bg-zetta-text-muted'
			}`}
		/>
	</button>
);

export default Toggle;
