interface SessionIndicatorProps {
	sessionType: TimerState['session_type'];
	hasOverride: boolean;
	currentSession?: number;
	totalSessions?: number;
}

const SessionIndicator =({
	sessionType,
	hasOverride
}: SessionIndicatorProps) => {
	return (
		<div className='absolute top-6 flex flex-col items-center gap-2'>
			<span className='text-[10px] font-bold uppercase tracking-[0.2em] text-zetta-text-muted'>
				{sessionType.replace('_', ' ')}
			</span>

			{hasOverride && (
				<span className='px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 rounded-full border border-amber-500/20'>
					Override
				</span>
			)}
		</div>
	);
}

export default SessionIndicator;
