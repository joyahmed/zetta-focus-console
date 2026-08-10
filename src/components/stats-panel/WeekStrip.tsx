import { useSessionHistory } from '../../hooks/use-session-history';

/** Bars this short need a floor, or a ten-minute day is indistinguishable
    from a day with nothing in it. */
const MIN_BAR = 8;

/**
 * The last seven days as seven bars.
 *
 * The four headline numbers count sessions today and minutes ever, which are
 * the two spans nobody judges their own work over. A week is the one that means
 * something, and it is the one the panel had nothing to say about.
 *
 * Height is relative to the best day in the window rather than to a fixed
 * target, because the app has no opinion about how long you should work — the
 * shape says how this week went against itself.
 */
const WeekStrip = () => {
	const { days, totalMinutes, totalSessions, peak } = useSessionHistory();

	return (
		<div className='p-2.5 md:p-3 rounded-xl border border-zetta-border bg-zetta-panel w-full shrink-0'>
			<div className='flex items-baseline justify-between mb-2.5'>
				<span className='text-[10px] uppercase tracking-wider font-semibold text-zetta-text-muted'>
					Last 7 Days
				</span>
				<span className='text-[10px] text-zetta-text-secondary tabular-nums'>
					{totalSessions} sess · {totalMinutes} min
				</span>
			</div>

			<div className='flex items-end justify-between gap-1 h-14'>
				{days.map(day => (
					<div
						key={day.date}
						className='flex-1 flex flex-col items-center gap-1 min-w-0 group'
						title={`${day.date}: ${day.sessions} session${day.sessions === 1 ? '' : 's'}, ${day.focusMinutes} min`}
					>
						<div className='w-full flex-1 flex items-end'>
							<div
								className={`w-full rounded-sm transition-colors ${
									day.focusMinutes === 0
										? 'bg-zetta-inset'
										: day.isToday
											? 'bg-zetta-neon'
											: 'bg-zetta-neon/45 group-hover:bg-zetta-neon/70'
								}`}
								style={{
									height:
										day.focusMinutes === 0
											? MIN_BAR / 2
											: `${Math.max(MIN_BAR, (day.focusMinutes / peak) * 100)}%`
								}}
							/>
						</div>
						<span
							className={`text-[9px] tabular-nums ${
								day.isToday
									? 'text-zetta-neon font-semibold'
									: 'text-zetta-text-muted'
							}`}
						>
							{day.weekday}
						</span>
					</div>
				))}
			</div>
		</div>
	);
};

export default WeekStrip;
