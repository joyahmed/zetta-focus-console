import { useTerminalModal } from '../hooks/use-terminal-modal';

export default function TerminalModal({
	isOpen,
	onClose,
	onCommand,
	onHelp,
	sessionSummary,
	onSummaryRead,
	theme
}: TerminalModalProps) {
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
		onClose,
		onCommand,
		onHelp,
		sessionSummary,
		onSummaryRead,
		isLight
	});

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center'>
			{/* Backdrop */}
			<div
				className='absolute inset-0 bg-black/50 backdrop-blur-sm'
				onClick={onClose}
			/>

			{/* Modal - Centered, prominent size for focus */}
			<div
				className={`relative border rounded-lg shadow-2xl w-[90%] max-w-5xl h-[80%] flex flex-col ${isLight ? 'bg-white border-gray-300' : 'bg-zetta-card border-zetta-border'}`}
			>
				{/* Header */}
				<div
					className={`flex items-center justify-between px-4 py-2 border-b ${isLight ? 'border-gray-300 bg-gray-100' : 'border-zetta-border bg-zetta-bg/50'}`}
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
							className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-500'}`}
						>
							<span
								className={`px-1.5 py-0.5 rounded ${isLight ? 'bg-gray-200 text-gray-700' : 'bg-zetta-bg text-gray-500'}`}
							>
								Ctrl+T
							</span>{' '}
							to close
						</span>
						<button
							onClick={onClose}
							className={`p-1 transition-colors ${isLight ? 'text-gray-600 hover:text-gray-900' : 'text-gray-400 hover:text-white'}`}
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
					<div className='flex items-center gap-2 h-5'>
						<span
							className={
								isLight
									? 'text-green-600 font-mono'
									: 'text-green-400 font-mono'
							}
						>
							$
						</span>
						<span
							className={`font-mono ${isLight ? 'text-gray-900' : 'text-white'}`}
						>
							{input}
						</span>
						<span
							className={`w-2 h-4 ${isLight ? 'bg-green-600' : 'bg-green-400'} ${isExecuting ? 'animate-pulse' : ''}`}
						/>
					</div>
				</div>

				{/* Input Line - Fixed at bottom */}
				<form
					onSubmit={handleSubmit}
					className={`px-4 py-3 border-t ${isLight ? 'border-gray-300 bg-gray-100' : 'border-zetta-border bg-zetta-bg/50'}`}
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
			</div>
		</div>
	);
}
