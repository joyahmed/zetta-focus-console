import Toggle from './Toggle';


/**
 * The ambience switch.
 *
 * It used to be greyed out and labelled "Disabled in light mode", because the
 * panel it controls rendered a placeholder there. The panel draws its season in
 * both themes now, so the switch is a switch in both.
 */
const AmbientSection = ({
	ambienceEnabled,
	onAmbienceToggle,
	isLight
}: AmbientSectionProps) => (
	<section>
		<h3 className='text-sm font-medium uppercase tracking-wider mb-3 text-zetta-text-secondary'>
			Visual
		</h3>
		<div className='flex items-center justify-between p-3 rounded-lg border border-zetta-border bg-zetta-panel'>
			<div>
				<span className='text-sm text-zetta-text'>Ambient Animations</span>
				<div className='text-xs mt-0.5 text-zetta-text-muted'>
					Seasonal visual effects
				</div>
			</div>
			<Toggle
				{...{
					enabled: ambienceEnabled,
					onChange: onAmbienceToggle,
					isLight
				}}
			/>
		</div>
	</section>
);

export default AmbientSection;
