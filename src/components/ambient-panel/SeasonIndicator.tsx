const SeasonIndicator = ({
	season,
	motionIntensity,
	backgroundType,
	isLight
}: SeasonIndicatorProps) => (
	<div
		className='absolute bottom-2 right-2 text-xs capitalize'
		style={{ color: isLight ? '#6b7280' : 'var(--text-muted)' }}
	>
		{season} · {motionIntensity} · {backgroundType}
	</div>
);

export default SeasonIndicator;
