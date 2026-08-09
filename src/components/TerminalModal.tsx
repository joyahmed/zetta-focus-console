import { useTerminalModal } from '../hooks/use-terminal-modal';
import Modal from './Modal';

const TerminalModal = ({
	isOpen,
	onClose,
	onCommand,
	onHelp,
	sessionSummary,
	onSummaryRead
}: TerminalModalProps) => {
	const {
		input,
		setInput,
		inputRef,

		outputRef,
		history,
		isExecuting,

		handleSubmit,
		handleKeyDown,
		getLineColor
	} = useTerminalModal({
		isOpen,
		onCommand,
		onHelp,
		sessionSummary,
		onSummaryRead
	});

	return (
		<Modal
			{...{
				isOpen,
				onClose,
				size: 'lg' as ModalSize,
				fillHeight: true
			}}
		>
			{/* Its header is its own: a prompt on the left and the shortcut
			    that closes it on the right, rather than a plain title.

			    Every colour in this dialog used to be a ternary on the theme —
			    gray-100 against zetta-bg, gray-800 against white, twelve of
			    them — which is how the console ended up looking like a
			    different application in the light theme. They are tokens now,
			    and the tokens already know which theme they are in. */}
			<div className='flex items-center justify-between px-4 py-2 border-b border-zetta-border bg-zetta-panel shrink-0'>
				<div className='flex items-center gap-2'>
					<span className='font-mono text-sm text-zetta-success'>$</span>
					<span className='text-sm font-medium text-zetta-text'>
						Zetta Focus — Console
					</span>
				</div>
				<div className='flex items-center gap-3'>
					<span className='text-xs text-zetta-text-secondary'>
						<span className='px-1.5 py-0.5 rounded border border-zetta-border bg-zetta-inset font-mono mr-1 text-zetta-text'>
							Ctrl+T
						</span>{' '}
						to close
					</span>
					<button
						onClick={onClose}
						className='p-1 transition-colors text-zetta-text-secondary hover:text-zetta-text'
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							className='h-4 w-4'
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M6 18L18 6M6 6l12 12'
							/>
						</svg>
					</button>
				</div>
			</div>

			{/* Output Area - Scrollable */}
			<div
				ref={outputRef}
				className='flex-1 p-4 overflow-y-auto font-mono text-sm space-y-1'
			>
				{history.map((line, i) => (
					<div
						key={i}
						className={`${getLineColor(line.type)} whitespace-pre-wrap break-all`}
					>
						{line.content}
					</div>
				))}
				{/* A busy indicator, not a second prompt.
				    This used to echo `$ {input}` with a caret, so every
				    keystroke appeared twice: once here under the tips and
				    again in the real input at the foot of the dialog. The
				    input is the only place the command is typed now; this row
				    just shows the engine working. */}
				{isExecuting && (
					<div className='flex items-center gap-2 h-5'>
						<span className='font-mono text-zetta-success'>$</span>
						<span className='w-2 h-4 animate-pulse bg-zetta-success' />
					</div>
				)}
			</div>

			{/* Input Line - Fixed at bottom */}
			<form
				onSubmit={handleSubmit}
				className='px-4 py-3 border-t border-zetta-border bg-zetta-panel shrink-0'
			>
				<div className='flex items-center gap-2'>
					<span className='font-mono text-sm text-zetta-success'>$</span>
					<input
						ref={inputRef}
						type='text'
						value={input}
						onChange={e => setInput(e.target.value)}
						onKeyDown={handleKeyDown}
						className='flex-1 bg-transparent font-mono text-sm outline-none text-zetta-text placeholder-zetta-text-muted'
						placeholder='Enter command...'
						autoFocus
						disabled={isExecuting}
					/>
				</div>
			</form>
		</Modal>
	);
};

export default TerminalModal;
