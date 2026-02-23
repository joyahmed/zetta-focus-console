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
		<div className='flex-1 glass-panel p-2.5 rounded-xl border border-zetta-border bg-zetta-card hover:bg-zetta-bg transition-all flex flex-col justify-between min-h-0 relative group overflow-hidden'>

			{/* Background Glow */}
			<div className={`absolute -right-4 -bottom-4 w-16 h-16 rounded-full blur-2xl opacity-10 transition-opacity duration-500 group-hover:opacity-20 ${memoryTotal ? 'bg-cyan-500' : 'bg-purple-500'}`} />

			{/* Header */}
			<div className='flex items-center justify-between mb-2 relative z-10'>
				<span className='text-[10px] uppercase tracking-wider font-semibold text-zetta-text-muted'>
					{title}
				</span>
				<div className='flex items-center gap-1.5'>
					<div className={`w-1.5 h-1.5 rounded-full ${memoryTotal ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]' : 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.4)]'} animate-pulse`} />
					<span className='text-xs font-mono font-medium text-zetta-text'>
						{memoryTotal ? `${memoryPercent.toFixed(0)}%` : `${memoryUsed} MB`}
					</span>
				</div>
			</div>

			{/* Visual Bar */}
			<div className='relative h-1.5 w-full bg-zetta-border rounded-full overflow-hidden'>
				<div
					className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out ${memoryTotal ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]'}`}
					style={{
						width: `${memoryTotal ? memoryPercent : appBarPercent}%`
					}}
				/>
			</div>

			{/* Footer Info */}
			<div className='mt-2 flex justify-between items-center opacity-60 group-hover:opacity-100 transition-opacity duration-300 relative z-10'>
				<span className='text-[9px] font-medium text-zetta-text-muted uppercase tracking-wide'>
					RAM Usage
				</span>
				{memoryTotal && (
					<span className='text-[9px] font-mono text-zetta-text-muted'>
						{memoryUsed} / {memoryTotal} MB
					</span>
				)}
			</div>
		</div>
	);
};

export default MonitorSection;
