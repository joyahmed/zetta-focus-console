import { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'success';
  content: string;
}

interface TerminalPanelProps {
  onCommand: (command: string) => string;
}

export function TerminalPanel({ onCommand }: TerminalPanelProps) {
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: 'output', content: 'Zetta Focus Console v1.0.0' },
    { type: 'output', content: 'Type "help" for available commands.' },
  ]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim();
    setHistory(prev => [...prev, { type: 'input', content: `$ ${cmd}` }]);
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);

    const result = onCommand(cmd);
    if (result) {
      const isError = result.startsWith('Error:');
      setHistory(prev => [...prev, { 
        type: isError ? 'error' : 'success', 
        content: result 
      }]);
    }

    setInput('');
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
      <div className="px-4 py-2 border-b border-zetta-border bg-zetta-bg/50">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          Terminal
        </span>
      </div>
      
      <div 
        ref={outputRef}
        className="flex-1 p-4 overflow-y-auto font-mono text-sm space-y-1"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((line, i) => (
          <div key={i} className={`${getLineColor(line.type)} whitespace-pre-wrap`}>
            {line.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-zetta-border bg-zetta-bg/50">
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-mono">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-white font-mono text-sm outline-none placeholder-gray-600"
            placeholder="Enter command..."
            autoFocus
          />
        </div>
      </form>
    </div>
  );
}
