import { TimerState } from '../state';

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
  const progress = timer.totalSeconds > 0 
    ? ((timer.totalSeconds - timer.remainingSeconds) / timer.totalSeconds) * 100 
    : 0;
  
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-zetta-card border border-zetta-border rounded-lg">
      <div className="flex items-center gap-2 mb-4">
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

      <div className="relative w-64 h-64 flex items-center justify-center">
        <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 260 260">
          <circle
            cx="130"
            cy="130"
            r="120"
            fill="none"
            stroke="#2a2f3a"
            strokeWidth="8"
          />
          <circle
            cx="130"
            cy="130"
            r="120"
            fill="none"
            stroke={glowColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
            style={{
              filter: `drop-shadow(0 0 6px ${glowColor})`,
            }}
          />
        </svg>
        <div className="text-5xl font-bold text-white tracking-tight">
          {formatTime(timer.remainingSeconds)}
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        {timer.status === 'idle' && (
          <button
            onClick={onStart}
            className="px-6 py-2 text-sm font-medium text-white bg-zetta-border hover:bg-gray-600 rounded transition-colors"
          >
            START
          </button>
        )}
        {timer.status === 'running' && (
          <button
            onClick={onPause}
            className="px-6 py-2 text-sm font-medium text-white bg-zetta-border hover:bg-gray-600 rounded transition-colors"
          >
            PAUSE
          </button>
        )}
        {timer.status === 'paused' && (
          <>
            <button
              onClick={onResume}
              className="px-6 py-2 text-sm font-medium text-white bg-zetta-border hover:bg-gray-600 rounded transition-colors"
            >
              RESUME
            </button>
            <button
              onClick={onStop}
              className="px-6 py-2 text-sm font-medium text-red-400 border border-red-400/30 hover:bg-red-400/10 rounded transition-colors"
            >
              STOP
            </button>
          </>
        )}
        {timer.status === 'completed' && (
          <button
            onClick={onStart}
            className="px-6 py-2 text-sm font-medium text-white bg-zetta-border hover:bg-gray-600 rounded transition-colors"
          >
            RESTART
          </button>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 uppercase tracking-wider">
        {timer.sessionType === 'focus' ? 'Focus Session' : 
         timer.sessionType === 'short_break' ? 'Short Break' : 'Long Break'}
      </div>
    </div>
  );
}
