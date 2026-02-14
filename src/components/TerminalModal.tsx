import { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'success';
  content: string;
}

interface TerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand: (command: string) => Promise<string>;
  onHelp: () => void;
  sessionSummary?: string | null;
  onSummaryRead?: () => void;
}

export function TerminalModal({
  isOpen,
  onClose,
  onCommand,
  onHelp,
  sessionSummary,
  onSummaryRead
}: TerminalModalProps) {
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: 'output', content: 'Zetta Focus Console v1.0.0' },
    { type: 'output', content: 'Type "help" for available commands.' },
    { type: 'output', content: 'Press ESC to close terminal.' },
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
      setHistory(prev => [...prev, { type: 'success', content: sessionSummary }]);
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
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isExecuting) return;

    const cmd = input.trim().toLowerCase();
    setHistory(prev => [...prev, { type: 'input', content: `$ ${input.trim()}` }]);
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
        setHistory(prev => [...prev, {
          type: isError ? 'error' : 'success',
          content: result
        }]);
      }
    } catch (error) {
      setHistory(prev => [...prev, {
        type: 'error',
        content: `Error: ${error}`
      }]);
    }

    setIsExecuting(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
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
    switch (type) {
      case 'input': return 'text-gray-300';
      case 'output': return 'text-gray-400';
      case 'error': return 'text-red-400';
      case 'success': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal - Centered, prominent size for focus */}
      <div className="relative bg-zetta-card border border-zetta-border rounded-lg shadow-2xl w-[90%] max-w-5xl h-[80%] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-zetta-border bg-zetta-bg/50">
          <div className="flex items-center gap-2">
            <span className="text-green-400 font-mono text-sm">$</span>
            <span className="text-sm font-medium text-white">Zetta Focus — Console</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              <span className="px-1.5 py-0.5 bg-zetta-bg rounded">ESC</span> to close
            </span>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Output Area - Scrollable */}
        <div
          ref={outputRef}
          className="flex-1 p-4 overflow-y-auto font-mono text-sm space-y-1"
        >
          {history.map((line, i) => (
            <div key={i} className={`${getLineColor(line.type)} whitespace-pre-wrap break-all`}>
              {line.content}
            </div>
          ))}
          <div className="flex items-center gap-2 h-5">
            <span className="text-green-400 font-mono">$</span>
            <span className="text-white font-mono">{input}</span>
            <span className={`w-2 h-4 bg-green-400 ${isExecuting ? 'animate-pulse' : ''}`} />
          </div>
        </div>

        {/* Input Line - Fixed at bottom */}
        <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-zetta-border bg-zetta-bg/50">
          <div className="flex items-center gap-2">
            <span className="text-green-400 font-mono text-sm">$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-white font-mono text-sm outline-none placeholder-gray-600"
              placeholder="Enter command..."
              autoFocus
              disabled={isExecuting}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
