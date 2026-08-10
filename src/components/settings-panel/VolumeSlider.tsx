/**
 * The volume track, filled to the current level.
 *
 * The two-stop gradient used to pick its unfilled colour from an `isLight`
 * prop — `#d1d5db` or `#374151`, two greys hard-coded next to a theme that
 * already publishes one. `--bg-inset` is the token for the inside of a
 * control and moves with the theme on its own.
 */
const VolumeSlider = ({ volume, onVolumeChange }: VolumeSliderProps) => (
	<input
		type='range'
		min='0'
		max='100'
		value={volume}
		aria-label='Ambient sound volume'
		onChange={e => onVolumeChange(parseInt(e.target.value))}
		className='w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-zetta-info'
		style={{
			background: `linear-gradient(to right,
				var(--color-info) 0%,
				var(--color-info) ${volume}%,
				var(--bg-inset) ${volume}%,
				var(--bg-inset) 100%)`
		}}
	/>
);

export default VolumeSlider;
