import { TerminalIcon } from './icons';

interface CommandSpotlightProps {
	onClick: () => void;
}

const CommandSpotlight = ({ onClick }: CommandSpotlightProps) => (
	<button
		onClick={onClick}
		className='group flex-1 max-w-md mx-4 relative'
	>
		<div className='relative flex items-center justify-between px-4 py-1.5 rounded-lg bg-[var(--bg-command)] hover:bg-[var(--bg-command-hover)] transition-all backdrop-blur-xl focus-within:shadow-[inset_0_0_20px_rgba(139,92,246,0.1)]'>
			<div className='flex items-center gap-3'>
				<TerminalIcon className='h-4 w-4 text-zetta-text-muted group-hover:text-zetta-text-secondary transition-colors' />
				<span className='text-sm text-zetta-text-muted group-hover:text-zetta-text-secondary transition-colors font-medium'>
					Type a command...
				</span>
			</div>
			<div className='flex items-center gap-1.5'>
				<kbd className='hidden md:inline-flex items-center h-5 px-1.5 text-[10px] font-mono text-zetta-text-muted bg-zetta-border border border-zetta-border rounded backdrop-blur-sm'>
					Ctrl
				</kbd>
				<kbd className='hidden md:inline-flex items-center h-5 px-1.5 text-[10px] font-mono text-zetta-text-muted bg-zetta-border border border-zetta-border rounded backdrop-blur-sm'>
					T
				</kbd>
			</div>
		</div>
	</button>
);

export default CommandSpotlight;
