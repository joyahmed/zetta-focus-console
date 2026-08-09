import { ReactNode, useEffect } from 'react';

/**
 * A panel that slides in from the right.
 *
 * Settings had this behaviour written inline and nothing else could reuse it,
 * so the keyboard shortcuts ended up as a centred dialog and then as a cramped
 * dropdown before that — three presentations for the same idea. Anything that
 * is a side panel uses this, and they stay identical because they are the same
 * component rather than because someone kept them in sync.
 */

interface DrawerProps {
	isOpen: boolean;
	onClose: () => void;
	title: ReactNode;
	children: ReactNode;
}

const Drawer = ({ isOpen, onClose, title, children }: DrawerProps) => {
	useEffect(() => {
		if (!isOpen) return;

		const onKeyDown = (e: globalThis.KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				onClose();
			}
		};

		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [isOpen, onClose]);

	return (
		<>
			{/* Kept mounted and faded rather than unmounted, so the panel can
			    animate out instead of vanishing. */}
			<div
				className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
					isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
				}`}
				onClick={onClose}
			/>

			<aside
				className={`fixed top-0 right-0 h-full z-50 flex flex-col glass-panel border-l border-zetta-border transform transition-transform duration-300 w-full sm:w-96 lg:w-[28rem] 2xl:w-[32rem] ${
					isOpen ? 'translate-x-0' : 'translate-x-full'
				}`}
			>
				<header className='flex items-center justify-between px-5 h-[60px] shrink-0 border-b border-zetta-border'>
					<h2 className='text-sm font-semibold uppercase tracking-wider text-zetta-text'>
						{title}
					</h2>
					<button
						onClick={onClose}
						aria-label='Close'
						className='p-1.5 rounded-md text-zetta-text-secondary hover:text-zetta-text hover:bg-white/10 transition-colors'
					>
						<svg
							className='w-5 h-5'
							fill='none'
							stroke='currentColor'
							strokeWidth={2}
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M6 18L18 6M6 6l12 12'
							/>
						</svg>
					</button>
				</header>

				<div className='flex-1 overflow-y-auto custom-scrollbar'>
					{children}
				</div>
			</aside>
		</>
	);
};

export default Drawer;
