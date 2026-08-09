import { useTerminalModal } from '../hooks/use-terminal-modal';
import Modal from './Modal';

const TerminalModal = ({
	isOpen,
	onClose,
	onCommand,
	onHelp,
	sessionSummary,
	onSummaryRead,
	theme
}: TerminalModalProps) => {
	const isLight = theme === 'light';

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
		onSummaryRead,
		isLight
	});

	return (
		<Modal
			{...{
				isOpen,
				onClose,
				size: 'lg' as ModalSize,
				fillHeight: true,
				/* The console is the one dialog that wants an opaque panel in
				   light mode — a wall of monospace on a translucent card is
				   hard to read. The class is a CSS hook rather than a Tailwind
				   colour, because a `bg-white` passed alongside the shell's
				   `bg-zetta-card` loses or wins on stylesheet order; see
				   index.css. It is inert outside the light theme. */
				panelClassName: 'terminal-modal-white'
			}}
		>
			{/* Its header is its own: a prompt on the left and the shortcut
			    that closes it on the right, rather than a plain title. */}
			<div
				className={`flex items-center justify-between px-4 py-2 border-b shrink-0 ${isLight ? 'border-gray-300 bg-gray-100' : 'border-zetta-border bg-zetta-bg/50'}`}
			>
				<div className='flex items-center gap-2'>
					<span
						className={`font-mono text-sm ${isLight ? 'text-green-600' : 'text-green-400'}`}
					>
						$
					</span>
					<span
						className={`text-sm font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}
					>
						Zetta Focus — Console
					</span>
				</div>
				<div className='flex items-center gap-3'>
					<span
						className={`text-xs ${isLight ? 'text-gray-600' : 'text-zetta-text-secondary'}`}
					>
						<span
							className={`px-1.5 py-0.5 rounded border font-mono mr-1 ${isLight ? 'bg-gray-200 border-gray-300 text-gray-800' : 'bg-white/10 border-white/15 text-zetta-text'}`}
						>
							Ctrl+T
						</span>{' '}
						to close
					</span>
					<button
						onClick={onClose}
						className={`p-1 transition-colors ${isLight ? 'text-gray-600 hover:text-gray-900' : 'text-zetta-text-secondary hover:text-white'}`}
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
				className={`flex-1 p-4 overflow-y-auto font-mono text-sm space-y-1 ${isLight ? 'bg-gray-50' : ''}`}
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
						<span
							className={`font-mono ${isLight ? 'text-green-600' : 'text-green-400'}`}
						>
							$
						</span>
						<span
							className={`w-2 h-4 animate-pulse ${isLight ? 'bg-green-600' : 'bg-green-400'}`}
						/>
					</div>
				)}
			</div>

			{/* Input Line - Fixed at bottom */}
			<form
				onSubmit={handleSubmit}
				className={`px-4 py-3 border-t shrink-0 ${isLight ? 'border-gray-300 bg-gray-100' : 'border-zetta-border bg-zetta-bg/50'}`}
			>
				<div className='flex items-center gap-2'>
					<span
						className={`font-mono text-sm ${isLight ? 'text-green-600' : 'text-green-400'}`}
					>
						$
					</span>
					<input
						ref={inputRef}
						type='text'
						value={input}
						onChange={e => setInput(e.target.value)}
						onKeyDown={handleKeyDown}
						className={`flex-1 bg-transparent font-mono text-sm outline-none ${isLight ? 'text-gray-900 placeholder-gray-400' : 'text-white placeholder-gray-600'}`}
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
