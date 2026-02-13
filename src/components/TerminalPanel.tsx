import { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'success';
  content: string;
}

interface TerminalPanelProps {
  onCommand: (command: string) => Promise<string>;
}

export function TerminalPanel({ onCommand }: TerminalPanelProps) {
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: 'output', content: 'Zetta Focus Console v1.0.0' },
    { type: 'output', content: 'Type "help" for available commands.' },
  ]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isExecuting) return;

    const cmd = input.trim();
    setHistory(prev => [...prev, { type: 'input', content: `$ ${cmd}` }]);
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);
    setIsExecuting(true);

    try {
      const result = await onCommand(cmd);
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

    setInput('');
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

  return (
    <div className="flex flex-col h-full bg-zetta-card border border-zetta-border rounded-lg overflow-hidden">
      <div className="px-2 md:px-4 py-1.5 md:py-2 border-b border-zetta-border bg-zetta-bg/50">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          Terminal
        </span>
      </div>
      
      <div 
        ref={outputRef}
        className="flex-1 p-2 md:p-4 overflow-y-auto font-mono text-xs md:text-sm space-y-0.5 md:space-y-1"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((line, i) => (
          <div key={i} className={`${getLineColor(line.type)} whitespace-pre-wrap break-all`}>
            {line.content}
          </div>
        ))}
        <div className="flex items-center gap-1 md:gap-2 h-4 md:h-5">
          <span className="text-green-400 font-mono">$</span>
          <span className="text-white font-mono text-xs md:text-sm">{input}</span>
          <span className={`w-1.5 md:w-2 h-3 md:h-4 bg-green-400 ${isExecuting ? 'animate-pulse' : ''}`} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-2 md:p-4 border-t border-zetta-border bg-zetta-bg/50">
        <div className="flex items-center gap-1 md:gap-2">
          <span className="text-green-400 font-mono text-xs md:text-sm">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-white font-mono text-xs md:text-sm outline-none placeholder-gray-600"
            placeholder="Enter command..."
            autoFocus
            disabled={isExecuting}
          />
        </div>
      </form>
    </div>
  );
}
