import { useEffect, useRef, useState } from 'react';
import { KeyboardIcon } from './icons';

interface Shortcut {
	key: string;
	action: string;
	description: string;
}

const shortcuts: Shortcut[] = [
	{
		key: 'Ctrl+S',
		action: 'Start/Stop',
		description: 'Start or stop the timer'
	},
	{
		key: 'Ctrl+P',
		action: 'Pause/Resume',
		description: 'Pause or resume the timer'
	},
	{
		key: 'Ctrl+T',
		action: 'Terminal',
		description: 'Toggle terminal'
	},
	{
		key: 'Ctrl+H',
		action: 'Hide/Show',
		description: 'Hide or show window (global)'
	},
	{ key: 'Ctrl+,', action: 'Settings', description: 'Open settings' },
	{
		key: 'Ctrl+D',
		action: 'Theme',
		description: 'Toggle light/dark theme'
	},
	{
		key: 'Ctrl+M',
		action: 'Mute',
		description: 'Mute or unmute audio'
	},
	{
		key: 'Ctrl+=',
		action: 'Volume Up',
		description: 'Increase volume'
	},
	{
		key: 'Ctrl+-',
		action: 'Volume Down',
		description: 'Decrease volume'
	},
	{
		key: 'Ctrl+V',
		action: 'Voice',
		description: 'Toggle voice cues'
	},
	{
		key: 'Ctrl+B',
		action: 'Particles',
		description: 'Toggle background particles'
	}
];

export default function ShortcutsMenu() {
	const [isOpen, setIsOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				menuRef.current &&
				!menuRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () =>
			document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	return (
		<div className='relative' ref={menuRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='p-2 rounded-lg transition-all duration-200 hover:bg-white/10 text-zetta-text-secondary hover:text-zetta-text-primary'
				title='Keyboard Shortcuts'
			>
				<KeyboardIcon className='w-5 h-5' />
			</button>

			{isOpen && (
				<div className='absolute right-0 top-full mt-2 w-80 z-50'>
					<div className='glass-panel rounded-xl border border-zetta-border/50 shadow-xl overflow-hidden'>
						<div className='px-4 py-3 border-b border-zetta-border/50 bg-white/5 dark:bg-black'>
							<h3 className='text-sm font-semibold text-zetta-text-primary'>
								Keyboard Shortcuts
							</h3>
						</div>
						<div className='py-2 max-h-80 overflow-y-auto'>
							{shortcuts.map((shortcut, index) => (
								<div
									key={index}
									className='flex items-center justify-between px-4 py-2 hover:bg-white/5 transition-colors'
								>
									<span className='text-xs text-zetta-text-secondary'>
										{shortcut.description}
									</span>
									<kbd className='px-2 py-1 text-xs font-mono bg-zetta-bg-secondary border border-zetta-border rounded text-zetta-accent-primary'>
										{shortcut.key}
									</kbd>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
