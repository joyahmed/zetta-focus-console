import { KeyboardEvent, useEffect, useRef, useState } from 'react';


// Available commands for tab completion
const COMMANDS = [
	'help',
	'start',
	'stop',
	'pause',
	'resume',
	'status',
	'override clear',
	'sessions',
	'profile list',
	'profile switch',
	'season',
	'config show',
	'stats',
	'ambience on',
	'ambience off',
	'sound play',
	'sound stop',
	'sound volume',
	'sound mute',
	'alarm on',
	'alarm off',
	'system',
	'memory',
	'cpu',
	'usage',
	'theme',
	'clear',
	// Aliases (for display only)
	's',
	'st',
	'r',
	'p'
];

// Storage key for persistent history
const HISTORY_STORAGE_KEY = 'zetta_terminal_history';
const MAX_HISTORY_SIZE = 100;

export const useTerminalModal = ({
	isOpen,
	onCommand,
	onHelp: _onHelp,
	sessionSummary,
	onSummaryRead,
	isLight
}: UseTerminalModalProps) => {
	// Load persisted history from localStorage
	const loadPersistedHistory = (): string[] => {
		try {
			const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
			if (saved) {
				const parsed = JSON.parse(saved);
				if (Array.isArray(parsed)) {
					return parsed.slice(-MAX_HISTORY_SIZE);
				}
			}
		} catch (e) {
			console.error('Failed to load terminal history:', e);
		}
		return [];
	};

	// Save history to localStorage
	const saveHistory = (history: string[]) => {
		try {
			localStorage.setItem(
				HISTORY_STORAGE_KEY,
				JSON.stringify(history.slice(-MAX_HISTORY_SIZE))
			);
		} catch (e) {
			console.error('Failed to save terminal history:', e);
		}
	};

	const [history, setHistory] = useState<TerminalLine[]>([
		{ type: 'output', content: 'Zetta Focus Console v1.0.0' },
		{
			type: 'output',
			content: 'Type "help" for available commands.'
		},
		// No "press ESC to close" line: the header states how to close it, and
		// having the banner name one key while the header named another read
		// as two different ways out rather than one dialog.
		{
			type: 'output',
			content: 'Tip: Use Tab for autocomplete, ↑↓ for history.'
		}
	]);
	const [input, setInput] = useState('');
	const [commandHistory, setCommandHistory] = useState<string[]>(
		loadPersistedHistory
	);
	const [historyIndex, setHistoryIndex] = useState(-1);
	const [isExecuting, setIsExecuting] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const outputRef = useRef<HTMLDivElement>(null);

	// Save history when it changes
	useEffect(() => {
		if (commandHistory.length > 0) {
			saveHistory(commandHistory);
		}
	}, [commandHistory]);

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

	// Focus input when modal opens
	useEffect(() => {
		if (isOpen) {
			setTimeout(() => inputRef.current?.focus(), 100);
		}
	}, [isOpen]);

	// Scroll to bottom on new output
	useEffect(() => {
		if (outputRef.current) {
			outputRef.current.scrollTop = outputRef.current.scrollHeight;
		}
	}, [history]);

	// Global keyboard shortcuts
	useEffect(() => {
		const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
			// Ctrl+T to toggle terminal (per Command Palette spec)
			if (!isOpen) {
				if ((e.ctrlKey || e.metaKey) && e.key === 't') {
					e.preventDefault();
					// Parent handles this
				}
				if (e.key === '`' || e.key === '~') {
					e.preventDefault();
				}
			}
		};

		window.addEventListener('keydown', handleGlobalKeyDown);
		return () =>
			window.removeEventListener('keydown', handleGlobalKeyDown);
	}, [isOpen]);

	// Tab completion handler
	const handleTabCompletion = (currentInput: string): string => {
		const inputLower = currentInput.toLowerCase().trim();

		if (!inputLower) {
			return currentInput;
		}

		// Find matching commands
		const matches = COMMANDS.filter(cmd =>
			cmd.toLowerCase().startsWith(inputLower)
		);

		if (matches.length === 0) {
			return currentInput;
		}

		if (matches.length === 1) {
			// Single match - complete it
			return matches[0];
		}

		// Multiple matches - find the longest common prefix
		const firstMatch = matches[0];
		let commonPrefix = '';
		for (let i = 0; i < firstMatch.length; i++) {
			const char = firstMatch[i];
			if (matches.every(m => m[i] === char)) {
				commonPrefix += char;
			} else {
				break;
			}
		}

		// If common prefix is longer than input, use it
		if (commonPrefix.length > inputLower.length) {
			return commonPrefix;
		}

		// Otherwise, just return the first match
		return matches[0];
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isExecuting) return;

		setHistory(prev => [
			...prev,
			{ type: 'input', content: `$ ${input.trim()}` }
		]);
		setCommandHistory(prev => [...prev, input.trim()]);
		setHistoryIndex(-1);
		setInput('');

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
		} else if (e.key === 'Tab') {
			e.preventDefault();
			// Handle tab completion
			const completed = handleTabCompletion(input);
			if (completed !== input) {
				setInput(completed);
			}
		} else if (e.key === 'PageUp') {
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
		// Escape is not handled here — the Modal shell closes on it, as it
		// does for every other dialog. Handling it in both places meant two
		// close calls for one keypress.
	};

	const getLineColor = (type: TerminalLine['type']) => {
		if (isLight) {
			switch (type) {
				case 'input':
					return 'text-gray-800';
				case 'output':
					return 'text-gray-700';
				case 'error':
					return 'text-red-600';
				case 'success':
					return 'text-green-600';
				default:
					return 'text-gray-700';
			}
		}
		switch (type) {
			case 'input':
				return 'text-gray-300';
			case 'output':
				return 'text-gray-400';
			case 'error':
				return 'text-red-400';
			case 'success':
				return 'text-green-400';
			default:
				return 'text-gray-400';
		}
	};

	return {
		input,
		setInput,
		inputRef,

		outputRef,
		history,
		isExecuting,

		handleSubmit,
		handleKeyDown,
		getLineColor
	};
};
