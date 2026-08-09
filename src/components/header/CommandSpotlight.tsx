import { TerminalIcon } from './icons';


const CommandSpotlight = ({ onClick }: CommandSpotlightProps) => (
	<button
		onClick={onClick}
		className='group flex-1 max-w-md mx-4 relative'
	>
		<div className='relative flex items-center justify-between px-4 py-1.5 rounded-lg bg-[var(--bg-command)] hover:bg-[var(--bg-command-hover)] transition-all backdrop-blur-xl focus-within:shadow-[inset_0_0_20px_rgba(139,92,246,0.1)]'>
			<div className='flex items-center gap-3'>
				<TerminalIcon className='h-4 w-4 text-zetta-text-secondary group-hover:text-zetta-text transition-colors' />
				<span className='text-sm text-zetta-text-secondary group-hover:text-zetta-text transition-colors font-medium'>
					Type a command...
				</span>
			</div>
			{/* The keycaps sat in `bg-zetta-border` — a 6%-white border colour
			    used as a fill — with muted text on top, which left the shortcut
			    all but invisible against the bar. */}
			<div className='flex items-center gap-1.5'>
				{['Ctrl', 'T'].map(key => (
					<kbd
						key={key}
						className='hidden md:inline-flex items-center h-5 px-1.5 text-[10px] font-mono text-zetta-text bg-white/10 border border-white/15 rounded backdrop-blur-sm'
					>
						{key}
					</kbd>
				))}
			</div>
		</div>
	</button>
);

export default CommandSpotlight;
