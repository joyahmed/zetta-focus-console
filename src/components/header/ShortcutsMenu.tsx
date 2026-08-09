import { useState } from 'react';
import Modal from '../Modal';
import { KeyboardIcon } from './icons';

interface Shortcut {
	key: string;
	description: string;
	/** Works even when the app is not focused. */
	global?: boolean;
}

const SHORTCUT_GROUPS: { title: string; shortcuts: Shortcut[] }[] = [
	{
		title: 'Session',
		shortcuts: [
			{ key: 'Ctrl+S', description: 'Start or stop the timer' },
			{ key: 'Ctrl+P', description: 'Pause or resume' }
		]
	},
	{
		title: 'Windows',
		shortcuts: [
			{ key: 'Ctrl+T', description: 'Toggle the terminal' },
			{ key: 'Ctrl+,', description: 'Open settings' },
			{
				key: 'Ctrl+H',
				description: 'Hide or restore the window',
				global: true
			}
		]
	},
	{
		title: 'Appearance',
		shortcuts: [
			{ key: 'Ctrl+D', description: 'Toggle light and dark theme' },
			{
				key: 'Ctrl+B',
				description: 'Toggle background particles',
				global: true
			}
		]
	},
	{
		title: 'Audio',
		shortcuts: [
			{ key: 'Ctrl+M', description: 'Mute or unmute' },
			{ key: 'Ctrl+=', description: 'Volume up' },
			{ key: 'Ctrl+-', description: 'Volume down' },
			{ key: 'Ctrl+V', description: 'Toggle voice cues' }
		]
	}
];

export default function ShortcutsMenu() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<button
				onClick={() => setIsOpen(true)}
				className='p-2 rounded-lg transition-all duration-200 hover:bg-white/10 text-zetta-text-secondary hover:text-zetta-text-primary'
				title='Keyboard Shortcuts'
			>
				<KeyboardIcon className='w-5 h-5' />
			</button>

			<Modal
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				title='Keyboard Shortcuts'
			>
				<div className='px-5 py-4 overflow-y-auto custom-scrollbar'>
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5'>
						{SHORTCUT_GROUPS.map(group => (
							<section key={group.title}>
								<h3 className='text-xs font-medium text-zetta-text-secondary uppercase tracking-wider mb-2'>
									{group.title}
								</h3>
								<div className='flex flex-col gap-1'>
									{group.shortcuts.map(shortcut => (
										<div
											key={shortcut.key}
											className='flex items-center justify-between gap-4 px-2 py-1.5 rounded hover:bg-white/5 transition-colors'
										>
											<span className='text-sm text-zetta-text'>
												{shortcut.description}
												{shortcut.global && (
													<span className='ml-1.5 text-[10px] uppercase tracking-wide text-zetta-text-muted'>
														global
													</span>
												)}
											</span>
											<kbd className='shrink-0 px-2 py-1 text-xs font-mono bg-zetta-bg-secondary border border-zetta-border rounded text-zetta-accent-primary'>
												{shortcut.key}
											</kbd>
										</div>
									))}
								</div>
							</section>
						))}
					</div>

					<p className='mt-5 pt-4 border-t border-zetta-border text-xs text-zetta-text-muted'>
						Shortcuts marked <span className='uppercase'>global</span>{' '}
						work from any application. The rest need this window
						focused, and are ignored while you are typing in a field.
					</p>
				</div>
			</Modal>
		</>
	);
}
