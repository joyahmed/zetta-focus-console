import { useEffect, useRef, useState } from 'react';
import { commandGroups } from '../configs/modal-config';

export default function HelpModal({
	isOpen,
	onClose
}: HelpModalProps) {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const listRef = useRef<HTMLDivElement>(null);

	// Flatten commands for navigation
	const allCommands = commandGroups.flatMap(group =>
		group.commands.map(cmd => ({ ...cmd, group: group.title }))
	);

	useEffect(() => {
		if (!isOpen) {
			setSelectedIndex(0);
		}
	}, [isOpen]);

	useEffect(() => {
		if (isOpen && listRef.current) {
			const selectedElement = listRef.current.querySelector(
				`[data-index="${selectedIndex}"]`
			);
			if (selectedElement) {
				selectedElement.scrollIntoView({
					block: 'nearest',
					behavior: 'smooth'
				});
			}
		}
	}, [selectedIndex, isOpen]);

	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (e: globalThis.KeyboardEvent) => {
			switch (e.key) {
				case 'ArrowDown':
					e.preventDefault();
					setSelectedIndex(prev =>
						Math.min(prev + 1, allCommands.length - 1)
					);
					break;
				case 'ArrowUp':
					e.preventDefault();
					setSelectedIndex(prev => Math.max(prev - 1, 0));
					break;
				case 'Escape':
					e.preventDefault();
					onClose();
					break;
				case 'Enter':
					e.preventDefault();
					// Could implement selecting the command
					break;
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isOpen, onClose, allCommands.length]);

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center'>
			{/* Backdrop */}
			<div
				className='absolute inset-0 bg-black/70 backdrop-blur-sm'
				onClick={onClose}
			/>

			{/* Modal */}
			<div className='help-modal-white relative bg-zetta-card backdrop-blur-xl border border-zetta-border rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col m-4'>
				{/* Header */}
				<div className='flex items-center justify-between px-4 py-3 border-b border-zetta-border'>
					<h2 className='text-lg font-semibold text-zetta-text flex items-center gap-2'>
						<span className='text-green-400'>?</span> Available
						Commands
					</h2>
					<div className='flex items-center gap-2 text-xs text-zetta-text-secondary'>
						<span className='help-modal-white px-1.5 py-0.5 bg-zetta-bg rounded border border-zetta-border text-zetta-text-muted'>
							ESC
						</span>
						<span>to close</span>
					</div>
				</div>

				{/* Command List */}
				<div ref={listRef} className='flex-1 overflow-y-auto p-4 custom-scrollbar'>
					{commandGroups.map((group, groupIndex) => {
						const startIndex = commandGroups
							.slice(0, groupIndex)
							.reduce((acc, g) => acc + g.commands.length, 0);

						return (
							<div key={group.title} className='mb-4 last:mb-0'>
								<h3 className='help-modal-white text-xs font-medium text-zetta-text-secondary uppercase tracking-wider mb-2 sticky top-0 bg-zetta-card/95 backdrop-blur py-1 z-10'>
									{group.title}
								</h3>
								<div className='space-y-1'>
									{group.commands.map((cmd, cmdIndex) => {
										const globalIndex = startIndex + cmdIndex;
										const isSelected = globalIndex === selectedIndex;

										return (
											<div
												key={cmd.cmd}
												data-index={globalIndex}
												className={`flex items-start gap-3 px-3 py-2 rounded transition-colors border ${
													isSelected
														? 'bg-zetta-neon/15 border-zetta-neon/30'
														: 'border-transparent hover:bg-zetta-bg'
												}`}
											>
												<code
													className={`text-sm font-mono ${
														isSelected
															? 'text-green-400'
															: 'text-green-400/80'
													}`}
												>
													{cmd.cmd}
												</code>
												<span
													className={`text-sm ${isSelected ? 'text-zetta-text' : 'text-zetta-text-secondary'}`}
												>
													{cmd.description}
												</span>
											</div>
										);
									})}
								</div>
							</div>
						);
					})}
				</div>

				{/* Footer */}
				<div className='px-4 py-3 border-t border-zetta-border flex items-center justify-between text-xs text-zetta-text-secondary'>
					<div className='flex items-center gap-4'>
						<span className='flex items-center gap-1'>
							<span className='help-modal-white px-1.5 py-0.5 bg-zetta-bg rounded border border-zetta-border text-zetta-text-muted'>
								UP
							</span>
							<span className='help-modal-white px-1.5 py-0.5 bg-zetta-bg rounded border border-zetta-border text-zetta-text-muted'>
								DOWN
							</span>
							<span>navigate</span>
						</span>
					</div>
					<span>{allCommands.length} commands</span>
				</div>
			</div>
		</div>
	);
}
