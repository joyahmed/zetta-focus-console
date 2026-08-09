import {
	BarsIcon,
	BoltIcon,
	ChartIcon,
	ClockIcon,
	FlameIcon
} from './icons';
import { useStatsPanel } from '../../hooks/use-stats-panel';

/** The four headline numbers. Written once as data because the card around
    them was previously copied out four times — a hundred lines in which the
    only differences were a label, a unit, an icon and which field of `stats`
    was read. Adding a fifth statistic is now a line here. */
const STAT_CARDS: StatCard[] = [
	{
		label: 'TODAY',
		unit: 'sess',
		tone: 'text-blue-400',
		Icon: ClockIcon,
		read: stats => stats.sessions_today
	},
	{
		label: 'FOCUS TIME',
		unit: 'min',
		tone: 'text-purple-400',
		Icon: BoltIcon,
		read: stats => stats.total_focus_minutes
	},
	{
		label: 'STREAK',
		unit: 'days',
		tone: 'text-orange-400',
		Icon: FlameIcon,
		read: stats => stats.current_streak
	},
	{
		label: 'LAST',
		unit: 'min',
		tone: 'text-emerald-400',
		Icon: BarsIcon,
		read: stats => stats.last_session_duration
	}
];

const StatsPanel = ({ appState }: StatsPanelProps) => {
	const { stats, dev_mode: devMode } = appState;
	const fields = useStatsPanel(appState);

	return (
		<div className='panel h-full flex flex-col gap-3 md:gap-4 p-3 md:p-4 overflow-hidden'>
			{/* The grid gives this panel an equal half of the window, which is
			    more room than its content needs. Rather than leaving a void
			    underneath, the sections space out and the meters sit against
			    the bottom edge. */}
			<div className='flex flex-col w-full h-full min-h-0 gap-y-3'>
				{/* Header Section */}
				<div className='flex items-center justify-between w-full shrink-0'>
					<div className='flex items-center gap-2'>
						<div className='p-1.5 rounded-lg bg-zetta-bg border border-zetta-border'>
							<ChartIcon className='h-4 w-4 text-zetta-neon' />
						</div>
						<h2 className='text-sm font-semibold tracking-wide text-zetta-text'>
							STATISTICS
						</h2>
					</div>
				</div>

				{/* Main Grid - Responsive */}
				<div className='flex flex-wrap gap-2 w-full shrink-0'>
					{STAT_CARDS.map(({ label, unit, tone, Icon, read }) => (
						<div
							key={label}
							className='flex-1 basis-28 min-w-0 p-3 rounded-xl border border-zetta-border bg-zetta-panel hover:bg-zetta-surface transition-colors group relative overflow-hidden'
						>
							{/* The icon was a 15% watermark, which against this
							    background is not a faint icon so much as no icon. */}
							<div className='absolute right-1.5 top-1.5 opacity-60 group-hover:opacity-100 transition-opacity'>
								<Icon className={`h-5 w-5 ${tone}`} />
							</div>
							<div className='text-xs text-zetta-text-secondary mb-1 font-medium tracking-wide'>
								{label}
							</div>
							<div className='text-2xl font-bold text-zetta-text tracking-tight flex items-baseline gap-1.5'>
								{read(stats)}
								<span className='text-xs font-normal text-zetta-text-secondary'>
									{unit}
								</span>
							</div>
						</div>
					))}
				</div>

				{/* Engine diagnostics.
				    This used to show four fields and then stretch to fill the
				    panel, which reads worse than a short box — a large empty
				    container with a border around nothing. The engine knows a
				    good deal more than four things about itself, and a panel
				    called diagnostics should say so. */}
				<div className='p-2.5 md:p-3 rounded-xl border border-zetta-border bg-zetta-panel w-full flex-1 flex flex-col min-h-0'>
					<div className='flex items-center gap-2 mb-2 shrink-0'>
						<div
							className={`w-1.5 h-1.5 rounded-full ${devMode ? 'bg-zetta-neon animate-pulse' : 'bg-zetta-text-muted'}`}
						/>
						<span className='text-[10px] uppercase tracking-wider font-semibold text-zetta-text-muted'>
							Engine Diagnostics
						</span>
					</div>

					{/* Rows, not boxes.
					    Each value used to sit in a filled, bordered rectangle
					    stretched to fill the row — twelve heavy blocks with faint
					    labels, which read as a different application bolted into
					    the panel. The value carries the weight now and the label
					    is the quiet part, separated by a hairline rather than
					    enclosed. */}
					<dl className='grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-2.5 content-start flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1'>
						{fields.map(field => (
							<div
								key={field.label}
								className='flex flex-col gap-0.5 min-w-0 pb-1.5 border-b border-zetta-border'
							>
								<dt className='text-[9px] uppercase tracking-wider text-zetta-text-muted'>
									{field.label}
								</dt>
								<dd
									className={`font-mono text-[11px] truncate ${
										field.accent === 'good'
											? 'text-zetta-success'
											: field.accent === 'warn'
												? 'text-zetta-warning'
												: 'text-zetta-text'
									}`}
								>
									{field.value}
								</dd>
							</div>
						))}
					</dl>
				</div>

			</div>
		</div>
	);
};

export default StatsPanel;
