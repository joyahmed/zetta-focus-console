const SeasonIndicator = ({ season, motionIntensity }: SeasonIndicatorProps) => (
	<div className='absolute bottom-2 right-2 text-xs capitalize text-zetta-text-muted'>
		{season} · {motionIntensity}
	</div>
);

export default SeasonIndicator;
