import { KeyboardEvent, useEffect, useRef, useState } from 'react';

interface TerminalLine {
	type: 'input' | 'output' | 'error' | 'success';
	content: string;
}

interface TerminalPanelProps {
	onCommand: (command: string) => Promise<string>;
	onHelp: () => void;
	isFocused: boolean;
	onFocus: () => void;
	onBlur: () => void;
	sessionSummary?: string | null;
	onSummaryRead?: () => void;
}

export function TerminalPanel({
	onCommand,
	onHelp,
	isFocused,
	onFocus,
	onBlur,
	sessionSummary,
	onSummaryRead
}: TerminalPanelProps) {
	const [history, setHistory] = useState<TerminalLine[]>([
		{ type: 'output', content: 'Zetta Focus Console v1.0.0' },
		{
			type: 'output',
			content: 'Type "help" for available commands.'
		},
		{
			type: 'output',
			content: 'Press Ctrl+K to focus terminal, ESC to blur.'
		}
	]);
	const [input, setInput] = useState('');
	const [commandHistory, setCommandHistory] = useState<string[]>([]);
	const [historyIndex, setHistoryIndex] = useState(-1);
	const [isExecuting, setIsExecuting] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const outputRef = useRef<HTMLDivElement>(null);

	// Handle session summary from backend
	useEffect(() => {
		if (sessionSummary) {
			setHistory(prev => [
				...prev,
				{ type: 'success', content: sessionSummary }
			]);
			onSummaryRead?.();
		}
	}, [sessionSummary, onSummaryRead]);

	// Scroll to bottom on new output
	useEffect(() => {
		if (outputRef.current) {
			outputRef.current.scrollTop = outputRef.current.scrollHeight;
		}
	}, [history]);

	// Focus/blur handling
	useEffect(() => {
		if (isFocused) {
			inputRef.current?.focus();
		}
	}, [isFocused]);

	// Global keyboard shortcuts for terminal focus
	useEffect(() => {
		const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
			// Ctrl+K to focus terminal
			if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
				e.preventDefault();
				onFocus();
			}
			// ESC to blur terminal (only when terminal is focused)
			if (e.key === 'Escape' && isFocused) {
				e.preventDefault();
				onBlur();
			}
		};

		window.addEventListener('keydown', handleGlobalKeyDown);
		return () =>
			window.removeEventListener('keydown', handleGlobalKeyDown);
	}, [isFocused, onFocus, onBlur]);

	// Refocus input after command execution completes
	useEffect(() => {
		if (!isExecuting && isFocused) {
			inputRef.current?.focus();
		}
	}, [isExecuting, isFocused]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isExecuting) return;

		const cmd = input.trim().toLowerCase();
		setHistory(prev => [
			...prev,
			{ type: 'input', content: `$ ${input.trim()}` }
		]);
		setCommandHistory(prev => [...prev, input.trim()]);
		setHistoryIndex(-1);
		setInput('');

		// Handle help command specially - show modal instead
		if (cmd === 'help') {
			onHelp();
			return;
		}

		setIsExecuting(true);

		try {
			const result = await onCommand(input.trim());
			if (result) {
				const isError = result.startsWith('Error:');
				setHistory(prev => [
					...prev,
					{
						type: isError ? 'error' : 'success',
						content: result
					}
				]);
			}
		} catch (error) {
			setHistory(prev => [
				...prev,
				{
					type: 'error',
					content: `Error: ${error}`
				}
			]);
		}

		setIsExecuting(false);
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		// Arrow Up/Down for command history
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (commandHistory.length > 0) {
				const newIndex =
					historyIndex < commandHistory.length - 1
						? historyIndex + 1
						: historyIndex;
				setHistoryIndex(newIndex);
				setInput(
					commandHistory[commandHistory.length - 1 - newIndex] || ''
				);
			}
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (historyIndex > 0) {
				const newIndex = historyIndex - 1;
				setHistoryIndex(newIndex);
				setInput(
					commandHistory[commandHistory.length - 1 - newIndex] || ''
				);
			} else if (historyIndex === 0) {
				setHistoryIndex(-1);
				setInput('');
			}
		}
		// Page Up/Down for scrolling output
		else if (e.key === 'PageUp') {
			e.preventDefault();
			if (outputRef.current) {
				outputRef.current.scrollTop -= 200;
			}
		} else if (e.key === 'PageDown') {
			e.preventDefault();
			if (outputRef.current) {
				outputRef.current.scrollTop += 200;
			}
		}
	};

	const getLineColor = (type: TerminalLine['type']) => {
		switch (type) {
			case 'input':
				return 'var(--text-primary)';
			case 'output':
				return 'var(--text-secondary)';
			case 'error':
				return '#ef4444';
			case 'success':
				return '#22c55e';
			default:
				return 'var(--text-secondary)';
		}
	};

	return (
		<div
			className={`flex flex-col h-full bg-zetta-card border rounded-lg overflow-hidden transition-colors ${isFocused ? 'border-blue-500/50' : 'border-zetta-border'}`}
			onClick={() => {
				onFocus();
				inputRef.current?.focus();
			}}
		>
			<div className='px-2 md:px-4 py-1.5 md:py-2 border-b border-zetta-border bg-zetta-bg/50 flex items-center justify-between'>
				<span
					className='text-xs font-medium uppercase tracking-wider'
					style={{ color: 'var(--text-secondary)' }}
				>
					Terminal
				</span>
				{isFocused && (
					<span
						className='text-xs'
						style={{ color: 'var(--accent)' }}
					>
						Focused
					</span>
				)}
			</div>

			<div
				ref={outputRef}
				className='flex-1 p-2 md:p-4 overflow-y-auto font-mono text-xs md:text-sm space-y-0.5 md:space-y-1'
			>
				{history.map((line, i) => (
					<div
						key={i}
						className='whitespace-pre-wrap break-all'
						style={{ color: getLineColor(line.type) }}
					>
						{line.content}
					</div>
				))}
				<div className='flex items-center gap-1 md:gap-2 h-4 md:h-5'>
					<span className='font-mono' style={{ color: '#22c55e' }}>
						$
					</span>
					<span
						className='font-mono text-xs md:text-sm'
						style={{ color: 'var(--text-primary)' }}
					>
						{input}
					</span>
					<span
						className={`w-1.5 md:w-2 h-3 md:h-4 ${isExecuting ? 'animate-pulse' : ''}`}
						style={{ backgroundColor: '#22c55e' }}
					/>
				</div>
			</div>

			<form
				onSubmit={handleSubmit}
				className='p-2 md:p-4 border-t border-zetta-border bg-zetta-bg/50'
			>
				<div className='flex items-center gap-1 md:gap-2'>
					<span
						className='font-mono text-xs md:text-sm'
						style={{ color: '#22c55e' }}
					>
						$
					</span>
					<input
						ref={inputRef}
						type='text'
						value={input}
						onChange={e => setInput(e.target.value)}
						onKeyDown={handleKeyDown}
						className='flex-1 bg-transparent font-mono text-xs md:text-sm outline-none placeholder'
						style={
							{
								color: 'var(--text-primary)',
								['--placeholder-color' as string]: 'var(--text-muted)'
							} as React.CSSProperties
						}
						placeholder='Enter command...'
						autoFocus
						disabled={isExecuting}
					/>
				</div>
			</form>
		</div>
	);
}
