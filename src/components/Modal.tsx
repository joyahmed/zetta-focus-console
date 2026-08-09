import { ReactNode, useEffect } from 'react';

/**
 * The single modal shell.
 *
 * Every dialog in the app used to bring its own backdrop and its own panel:
 * three different scrim opacities (70%, 60%, 50%), one without a blur at all,
 * and three unrelated widths. They read as four different applications. This is
 * the one presentation they all share now — change it here and every dialog
 * moves together.
 */

const SIZES = {
	sm: 'max-w-md',
	md: 'max-w-2xl',
	lg: 'max-w-5xl'
} as const;

export type ModalSize = keyof typeof SIZES;

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: ReactNode;
	size?: ModalSize;
	/** Fills the available height rather than hugging its content. */
	fillHeight?: boolean;
	children: ReactNode;
}

const Modal = ({
	isOpen,
	onClose,
	title,
	size = 'md',
	fillHeight = false,
	children
}: ModalProps) => {
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

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center'>
			{/* Scrim. Light enough to keep the season visible behind it — the
			    ambience is the point of the app, and blacking it out to 70%
			    threw that away every time a dialog opened. */}
			<div
				className='absolute inset-0 bg-black/50 backdrop-blur-sm'
				onClick={onClose}
			/>

			<div
				className={`relative bg-zetta-card backdrop-blur-xl border border-zetta-border rounded-lg shadow-2xl w-full ${SIZES[size]} ${fillHeight ? 'h-[80vh]' : 'max-h-[80vh]'} flex flex-col m-4`}
			>
				{title !== undefined && (
					<div className='flex items-center justify-between px-5 py-4 border-b border-zetta-border shrink-0'>
						<h2 className='text-lg font-semibold text-zetta-text'>
							{title}
						</h2>
						<button
							onClick={onClose}
							aria-label='Close'
							className='p-1 rounded transition-colors text-zetta-text-secondary hover:text-zetta-text hover:bg-white/10'
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
					</div>
				)}

				{children}
			</div>
		</div>
	);
};

export default Modal;
