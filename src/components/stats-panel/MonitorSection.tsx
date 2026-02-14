const MonitorSection = ({
	title,
	cpuUsage,
	memoryUsed,
	memoryTotal
}: {
	title: string;
	cpuUsage: number;
	memoryUsed: number;
	memoryTotal?: number;
}) => {
	const memoryPercent =
		memoryTotal && memoryTotal > 0
			? (memoryUsed / memoryTotal) * 100
			: 0;

	const appBarWidth = memoryTotal
		? memoryPercent
		: Math.min(memoryUsed / 2, 30);

	return (
		<div className='flex-1 p-2 md:p-3 bg-zetta-bg rounded-lg border border-zetta-border flex flex-col justify-between min-h-0'>
			<div
				className='text-[10px] uppercase tracking-wider mb-1 md:mb-2'
				style={{ color: 'var(--text-muted)' }}
			>
				{title}
			</div>
			<div className='space-y-1 md:space-y-2'>
				<div>
					<div className='flex items-center justify-between mb-0.5 md:mb-1'>
						<span
							className='text-[10px] md:text-xs'
							style={{ color: 'var(--text-secondary)' }}
						>
							CPU
						</span>
						<span
							className='text-[10px] md:text-xs'
							style={{ color: 'var(--text-primary)' }}
						>
							{cpuUsage.toFixed(1)}%
						</span>
					</div>
					<div className='h-1.5 md:h-2 bg-zetta-border rounded-full overflow-hidden'>
						<div
							className='h-full rounded-full transition-all duration-300'
							style={{
								width: `${Math.min(cpuUsage, 100)}%`,
								backgroundColor: 'var(--text-muted)'
							}}
						/>
					</div>
				</div>
				<div>
					<div className='flex items-center justify-between mb-0.5 md:mb-1'>
						<span
							className='text-[10px] md:text-xs'
							style={{ color: 'var(--text-secondary)' }}
						>
							RAM
						</span>
						{memoryTotal ? (
							<span
								className='text-[10px] md:text-xs'
								style={{ color: 'var(--text-primary)' }}
							>
								{memoryPercent.toFixed(0)}%
							</span>
						) : (
							<span
								className='text-[10px] md:text-xs'
								style={{ color: 'var(--text-primary)' }}
							>
								{memoryUsed} MB
							</span>
						)}
					</div>
					<div className='h-1.5 md:h-2 bg-zetta-border rounded-full overflow-hidden'>
						<div
							className='h-full rounded-full transition-all duration-300'
							style={{
								width: memoryTotal
									? `${memoryPercent}%`
									: `${appBarWidth}%`,
								backgroundColor: 'var(--text-muted)'
							}}
						/>
					</div>
					{memoryTotal && (
						<div
							className='text-[9px] md:text-[10px] mt-0.5 md:mt-1'
							style={{ color: 'var(--text-muted)' }}
						>
							{memoryUsed} / {memoryTotal} MB
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default MonitorSection;
