import { createPortal } from 'react-dom';
import { useModalDismiss } from '../hooks/use-modal-dismiss';

/**
 * The single modal shell.
 *
 * Every dialog in the app used to bring its own backdrop and its own panel:
 * three different scrim opacities (70%, 60%, 50%), one without a blur at all,
 * and three unrelated widths. They read as four different applications. This is
 * the one presentation they all share now — change it here and every dialog
 * moves together.
 */

const SIZES: Record<ModalSize, string> = {
	sm: 'max-w-md',
	/** The profile form, whose four-column stepper grid wants the extra 50px. */
	form: 'max-w-[500px]',
	md: 'max-w-2xl',
	lg: 'max-w-5xl'
};

const Modal = ({
	isOpen,
	onClose,
	title,
	size = 'md',
	fillHeight = false,
	children
}: ModalProps) => {
	useModalDismiss({ isOpen, onClose });

	if (!isOpen) return null;

	// Into <body>, for the reason the drawer gives at length: `position: fixed`
	// is only relative to the viewport while no ancestor establishes a
	// containing block, and `backdrop-filter` does. Every panel carries one, so
	// a dialog opened from inside a panel — the delete confirmation, say —
	// would otherwise be centred in that panel and clipped by its
	// `overflow-hidden`, rather than covering the window.
	return createPortal(
		<div className='fixed inset-0 z-50 flex items-center justify-center'>
			{/* Scrim. Light enough to keep the season visible behind it — the
			    ambience is the point of the app, and blacking it out to 70%
			    threw that away every time a dialog opened. */}
			<div className='absolute inset-0 modal-scrim' onClick={onClose} />

			<div
				className={`relative elevated-surface border border-zetta-border rounded-lg w-full ${SIZES[size]} ${fillHeight ? 'h-[80vh]' : 'max-h-[80vh]'} flex flex-col m-4`}
			>
				{title !== undefined && (
					<div className='flex items-center justify-between px-5 py-4 border-b border-zetta-border shrink-0'>
						<h2 className='text-lg font-semibold text-zetta-text'>
							{title}
						</h2>
						<button
							onClick={onClose}
							aria-label='Close'
							className='p-1 rounded transition-colors text-zetta-text-secondary hover:text-zetta-text hover:bg-zetta-panel'
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
		</div>,
		document.body
	);
};

export default Modal;
