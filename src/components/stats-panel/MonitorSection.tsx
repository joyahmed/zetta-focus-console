const MonitorSection = ({
	title,
	memoryUsed,
	memoryTotal
}: {
	title: string;
	memoryUsed: number;
	memoryTotal?: number;
}) => {
	const memoryPercent =
		memoryTotal && memoryTotal > 0
			? (memoryUsed / memoryTotal) * 100
			: 0;

	// For app memory, we visualize it relative to a reasonable cap (e.g., 500MB) for the bar/circle
	const appMemoryCap = 500;
	const appBarPercent = Math.min((memoryUsed / appMemoryCap) * 100, 100);

	return (
		<div className='flex-1 py-1 flex flex-col justify-between min-h-0 relative group'>
			{/* Header */}
			<div className='flex items-center justify-between mb-2'>
				<span
					className='text-[10px] uppercase tracking-wider font-medium'
					style={{ color: 'var(--text-muted)' }}
				>
					{title}
				</span>
				<div className='flex items-center gap-1.5'>
					<div className={`w-1.5 h-1.5 rounded-full ${memoryTotal ? 'bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.5)]' : 'bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.5)]'} opacity-80`} />
					<span
						className='text-xs font-mono font-medium'
						style={{ color: 'var(--text-primary)' }}
					>
						{memoryTotal ? `${memoryPercent.toFixed(0)}%` : `${memoryUsed} MB`}
					</span>
				</div>
			</div>

			{/* Visual Bar */}
			<div className='relative h-1 w-full bg-zetta-border rounded-full overflow-hidden'>
				<div
					className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out ${memoryTotal ? 'bg-cyan-500' : 'bg-purple-500'}`}
					style={{
						width: `${memoryTotal ? memoryPercent : appBarPercent}%`,
						opacity: 0.8
					}}
				/>
			</div>

			{/* Footer Info */}
			<div className='mt-1 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
				<span
					className='text-[9px]'
					style={{ color: 'var(--text-muted)' }}
				>
					RAM
				</span>
				{memoryTotal && (
					<span
						className='text-[9px] font-mono'
						style={{ color: 'var(--text-muted)' }}
					>
						{memoryUsed} / {memoryTotal} MB
					</span>
				)}
			</div>
		</div>
	);
};

export default MonitorSection;
