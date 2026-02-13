interface TimerState {
  remaining_seconds: number;
  total_seconds: number;
  status: 'idle' | 'running' | 'paused' | 'completed';
  session_type: 'focus' | 'short_break' | 'long_break';
}

interface TimerPanelProps {
  timer: TimerState;
  glowColor: string;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function getStatusLabel(status: TimerState['status']): string {
  switch (status) {
    case 'idle': return 'IDLE';
    case 'running': return 'RUNNING';
    case 'paused': return 'PAUSED';
    case 'completed': return 'COMPLETED';
    default: return 'IDLE';
  }
}

export function TimerPanel({ timer, glowColor, onStart, onPause, onResume, onStop }: TimerPanelProps) {
  const progress = timer.total_seconds > 0 
    ? ((timer.total_seconds - timer.remaining_seconds) / timer.total_seconds) * 100 
    : 0;
  
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-3 md:p-4 bg-zetta-card border border-zetta-border rounded-lg h-full">
      <div className="flex items-center gap-2 mb-2 md:mb-3">
        <span 
          className="w-2 h-2 rounded-full"
          style={{ 
            backgroundColor: timer.status === 'running' ? glowColor : '#6b7280',
            boxShadow: timer.status === 'running' ? `0 0 8px ${glowColor}` : 'none'
          }}
        />
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {getStatusLabel(timer.status)}
        </span>
      </div>

      <div className="relative w-32 h-32 md:w-48 md:h-48 lg:w-56 lg:h-56 flex items-center justify-center">
        <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="#2a2f3a"
            strokeWidth="6"
          />
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke={glowColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
            style={{
              filter: `drop-shadow(0 0 6px ${glowColor})`,
            }}
          />
        </svg>
        <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
          {formatTime(timer.remaining_seconds)}
        </div>
      </div>

      <div className="flex gap-2 md:gap-3 mt-3 md:mt-4">
        {timer.status === 'idle' && (
          <button
            onClick={onStart}
            className="px-4 md:px-6 py-1.5 md:py-2 text-xs md:text-sm font-medium text-white bg-zetta-border hover:bg-gray-600 rounded transition-colors"
          >
            START
          </button>
        )}
        {timer.status === 'running' && (
          <button
            onClick={onPause}
            className="px-4 md:px-6 py-1.5 md:py-2 text-xs md:text-sm font-medium text-white bg-zetta-border hover:bg-gray-600 rounded transition-colors"
          >
            PAUSE
          </button>
        )}
        {timer.status === 'paused' && (
          <>
            <button
              onClick={onResume}
              className="px-4 md:px-6 py-1.5 md:py-2 text-xs md:text-sm font-medium text-white bg-zetta-border hover:bg-gray-600 rounded transition-colors"
            >
              RESUME
            </button>
            <button
              onClick={onStop}
              className="px-4 md:px-6 py-1.5 md:py-2 text-xs md:text-sm font-medium text-red-400 border border-red-400/30 hover:bg-red-400/10 rounded transition-colors"
            >
              STOP
            </button>
          </>
        )}
        {timer.status === 'completed' && (
          <button
            onClick={onStart}
            className="px-4 md:px-6 py-1.5 md:py-2 text-xs md:text-sm font-medium text-white bg-zetta-border hover:bg-gray-600 rounded transition-colors"
          >
            RESTART
          </button>
        )}
      </div>

      <div className="mt-2 md:mt-3 text-xs text-gray-500 uppercase tracking-wider">
        {timer.session_type === 'focus' ? 'Focus Session' : 
         timer.session_type === 'short_break' ? 'Short Break' : 'Long Break'}
      </div>
    </div>
  );
}
