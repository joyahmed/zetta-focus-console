import { commandGroups } from '../configs/modal-config';
import { useHelpModal } from '../hooks/use-help-modal';
import Modal from './Modal';

/** The little bordered key. Written once for the three places this modal shows
    one — ESC in the header, UP and DOWN in the footer. */
const KeyCap = ({ children }: { children: React.ReactNode }) => (
	<span className='help-modal-white px-1.5 py-0.5 bg-zetta-bg rounded border border-zetta-border text-zetta-text-muted'>
		{children}
	</span>
);

const HelpModal = ({ isOpen, onClose }: HelpModalProps) => {
	const { selectedIndex, listRef, commandCount, groupOffsets } =
		useHelpModal({ isOpen });

	return (
		<Modal {...{ isOpen, onClose, panelClassName: 'help-modal-white' }}>
			{/* This dialog supplies its own header rather than passing a title:
			    the right-hand side is the ESC hint, not a close button, because
			    the list is driven from the keyboard. */}
			<div className='flex items-center justify-between px-4 py-3 border-b border-zetta-border shrink-0'>
				<h2 className='text-lg font-semibold text-zetta-text flex items-center gap-2'>
					<span className='text-green-400'>?</span> Available Commands
				</h2>
				<div className='flex items-center gap-2 text-xs text-zetta-text-secondary'>
					<KeyCap>ESC</KeyCap>
					<span>to close</span>
				</div>
			</div>

			{/* Command List */}
			<div
				ref={listRef}
				className='flex-1 overflow-y-auto p-4 custom-scrollbar'
			>
				{commandGroups.map((group, groupIndex) => {
					const startIndex = groupOffsets[groupIndex] ?? 0;

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
			<div className='px-4 py-3 border-t border-zetta-border flex items-center justify-between text-xs text-zetta-text-secondary shrink-0'>
				<div className='flex items-center gap-4'>
					<span className='flex items-center gap-1'>
						{['UP', 'DOWN'].map(key => (
							<KeyCap key={key}>{key}</KeyCap>
						))}
						<span>navigate</span>
					</span>
				</div>
				<span>{commandCount} commands</span>
			</div>
		</Modal>
	);
};

export default HelpModal;
