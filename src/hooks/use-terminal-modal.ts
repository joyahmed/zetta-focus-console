import { KeyboardEvent, useEffect, useRef, useState } from 'react';

interface UseTerminalModalProps {
	isOpen: boolean;
	onClose: () => void;
	onCommand: (command: string) => Promise<string>;
	onHelp: () => void;
	sessionSummary?: string | null;
	onSummaryRead?: () => void;
	isLight: boolean;
}

export const useTerminalModal = ({
	isOpen,
	onClose,
	onCommand,
	onHelp,
	sessionSummary,
	onSummaryRead,
	isLight
}: UseTerminalModalProps) => {
	const [history, setHistory] = useState<TerminalLine[]>([
		{ type: 'output', content: 'Zetta Focus Console v1.0.0' },
		{
			type: 'output',
			content: 'Type "help" for available commands.'
		},
		{ type: 'output', content: 'Press ESC to close terminal.' }
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

		// Handle help command specially
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
		} else if (e.key === 'Escape') {
			e.preventDefault();
			onClose();
		}
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
