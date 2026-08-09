import Modal from './Modal';

/** The confirm button, per tone. Spelled out rather than assembled, because
    the JIT scan cannot see a colour built at runtime. */
const TONES: Record<ConfirmTone, string> = {
	danger: 'bg-red-600 hover:bg-red-500 shadow-red-500/20',
	neutral: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'
};

/**
 * Ask before something that cannot be undone.
 *
 * The shell, the sizes and the scrim are Modal's; this only supplies the
 * question and the two answers, so a second irreversible action does not
 * arrive with a second dialog design.
 */
const ConfirmDialog = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmLabel = 'Confirm',
	cancelLabel = 'Cancel',
	tone = 'danger'
}: ConfirmDialogProps) => (
	<Modal {...{ isOpen, onClose, title, size: 'sm' as ModalSize }}>
		<div className='p-5 space-y-5'>
			<p className='text-sm text-zetta-text-secondary'>{message}</p>

			<div className='flex justify-end gap-3'>
				<button
					type='button'
					onClick={onClose}
					className='px-4 py-2 text-xs font-medium text-zetta-text-secondary hover:text-zetta-text hover:bg-zetta-panel rounded-md transition-colors'
				>
					{cancelLabel}
				</button>
				<button
					type='button'
					onClick={onConfirm}
					autoFocus
					className={`px-5 py-2 text-xs font-medium text-white rounded-md shadow-lg transition-all active:scale-[0.98] ${TONES[tone]}`}
				>
					{confirmLabel}
				</button>
			</div>
		</div>
	</Modal>
);

export default ConfirmDialog;
