import { invoke } from '@tauri-apps/api/core';
import { KeyboardEvent, useEffect, useRef, useState } from 'react';


/**
 * What Tab completes.
 *
 * This has to be the whole command set. It was missing `timer`, `break` and
 * `loop` — the three the app is pitched on — along with `strict`, `task`,
 * `devmode`, `engine` and `reset`, so the one line the README leads with was
 * the one line Tab would not finish for you.
 */
const COMMANDS = [
	'help',
	'start',
	'stop',
	'pause',
	'resume',
	'status',
	'sessions',
	// The override, which is the reason this is a terminal at all.
	'timer',
	'break',
	'loop',
	'override clear',
	// A second spelling of `timer`, kept because the compound parser reads it
	// too — `break 10m focus 50m` is the same as `break 10m timer 50m`.
	'focus',
	'profile list',
	'profile switch',
	'profile create',
	'profile edit',
	'profile duplicate',
	'profile delete',
	'season',
	'strict on',
	'strict off',
	'task set',
	'task show',
	'task clear',
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
	'theme',
	'system',
	'sysinfo',
	'memory',
	'cpu',
	'usage',
	'app usage',
	'engine state',
	'engine reset',
	'devmode on',
	'devmode off',
	'reset',
	'history',
	'history clear',
	'clear',
	// Aliases (for display only)
	's',
	'st',
	'r',
	'p'
];

/**
 * Where the history used to live.
 *
 * It is engine state now, next to preferences on disk, because Rust owns state
 * and `localStorage` belongs to the webview rather than to the app. The key is
 * still read once so that an existing history survives the move, and removed
 * as soon as the engine has taken it.
 */
const LEGACY_HISTORY_KEY = 'zetta_terminal_history';

/** One colour per kind of line, in tokens that already follow the theme. */
const LINE_COLORS: Record<TerminalLine['type'], string> = {
	input: 'text-zetta-text',
	output: 'text-zetta-text-secondary',
	error: 'text-zetta-danger',
	success: 'text-zetta-success'
};

export const useTerminalModal = ({
	isOpen,
	onCommand,
	onHelp,
	sessionSummary,
	onSummaryRead
}: UseTerminalModalProps) => {
	/** Whatever the previous build left in the webview, if anything. */
	const readLegacyHistory = (): string[] => {
		try {
			const saved = localStorage.getItem(LEGACY_HISTORY_KEY);
			if (!saved) return [];
			const parsed = JSON.parse(saved);
			return Array.isArray(parsed)
				? parsed.filter((entry): entry is string => typeof entry === 'string')
				: [];
		} catch {
			// A history nobody can parse is not worth an error in the console.
			return [];
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
	const [commandHistory, setCommandHistory] = useState<string[]>([]);
	const [historyIndex, setHistoryIndex] = useState(-1);
	const [isExecuting, setIsExecuting] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const outputRef = useRef<HTMLDivElement>(null);

	/**
	 * Take the history from the engine.
	 *
	 * Asked for once on mount rather than carried on the state event: the
	 * engine broadcasts the whole of its state every second, and a hundred
	 * lines of history have no business riding along with it.
	 */
	useEffect(() => {
		let cancelled = false;

		const load = async () => {
			try {
				const legacy = readLegacyHistory();
				const stored = legacy.length
					? await invoke<string[]>('import_terminal_history', {
							history: legacy
						})
					: await invoke<string[]>('get_terminal_history');

				// Only once the engine has it, so a failed handover can be
				// retried on the next launch rather than losing the history.
				if (legacy.length) {
					localStorage.removeItem(LEGACY_HISTORY_KEY);
				}
				if (!cancelled) setCommandHistory(stored);
			} catch (e) {
				console.error('Failed to load terminal history:', e);
			}
		};

		load();
		return () => {
			cancelled = true;
		};
	}, []);

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

		const command = input.trim();

		setHistory(prev => [...prev, { type: 'input', content: `$ ${command}` }]);
		// Optimistic, so the arrow keys work before the round trip lands. The
		// engine collapses a repeat of the last command; so does this.
		setCommandHistory(prev =>
			prev[prev.length - 1] === command ? prev : [...prev, command]
		);
		invoke('push_terminal_history', { command }).catch(console.error);
		setHistoryIndex(-1);
		setInput('');

		/**
		 * `help` is a dialog of its own.
		 *
		 * It used to print the engine's entire command list into the console,
		 * which made the list and the console one surface: there was no way to
		 * dismiss the list except by closing the terminal it had been printed
		 * into, and no way to keep the list open while typing the command it
		 * described. The list has existed as its own modal the whole time —
		 * navigable with the arrow keys, closed with ESC — and this hook simply
		 * took `onHelp` and threw it away.
		 *
		 * Two dialogs, two states: ESC closes whichever is on top, which the
		 * modal shell already tracks, so the console is still there underneath.
		 */
		if (command === 'help') {
			onHelp();
			setHistory(prev => [
				...prev,
				{
					type: 'output',
					content:
						'Opened the command list. ESC closes it and leaves the console open.'
				}
			]);
			return;
		}

		setIsExecuting(true);

		try {
			const result = await onCommand(command);
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

			// `history clear` changes the list these arrow keys walk, so take
			// the engine's copy back rather than leaving a cleared history
			// still scrolling here.
			if (command.split(/\s+/)[0].toLowerCase() === 'history') {
				setCommandHistory(
					await invoke<string[]>('get_terminal_history')
				);
				setHistoryIndex(-1);
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

	/**
	 * What a line is, in colour.
	 *
	 * This was two switches — one set of grays and greens for the dark theme,
	 * another for the light — and the console had to be told which theme it was
	 * in to pick between them. Both sets said the same four things, so they are
	 * one table of tokens that already move with the theme.
	 */
	const getLineColor = (type: TerminalLine['type']) => LINE_COLORS[type];

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
