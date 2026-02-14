interface Stats {
  sessions_today: number;
  total_focus_minutes: number;
  current_streak: number;
  last_session_duration: number;
}

interface SystemStats {
  cpu_usage: number;
  memory_used: number;
  memory_total: number;
}

interface AppStats {
  cpu_usage: number;
  memory_used: number;
}

interface StatsPanelProps {
  stats: Stats;
  systemStats: SystemStats;
  appStats: AppStats;
  devMode?: boolean;
  timerStatus?: string;
  activeProfileName?: string;
}

function MonitorSection({ title, cpuUsage, memoryUsed, memoryTotal }: {
  title: string;
  cpuUsage: number;
  memoryUsed: number;
  memoryTotal?: number;
}) {
  const memoryPercent = memoryTotal && memoryTotal > 0
    ? (memoryUsed / memoryTotal) * 100
    : 0;

  const appBarWidth = memoryTotal ? memoryPercent : Math.min(memoryUsed / 2, 30);

  return (
    <div className="flex-1 p-2 md:p-3 bg-zetta-bg rounded-lg border border-zetta-border flex flex-col justify-between min-h-0">
      <div className="text-[10px] uppercase tracking-wider mb-1 md:mb-2" style={{ color: 'var(--text-muted)' }}>
        {title}
      </div>
      <div className="space-y-1 md:space-y-2">
        <div>
          <div className="flex items-center justify-between mb-0.5 md:mb-1">
            <span className="text-[10px] md:text-xs" style={{ color: 'var(--text-secondary)' }}>CPU</span>
            <span className="text-[10px] md:text-xs" style={{ color: 'var(--text-primary)' }}>{cpuUsage.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 md:h-2 bg-zetta-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(cpuUsage, 100)}%`, backgroundColor: 'var(--text-muted)' }}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-0.5 md:mb-1">
            <span className="text-[10px] md:text-xs" style={{ color: 'var(--text-secondary)' }}>RAM</span>
            {memoryTotal ? (
              <span className="text-[10px] md:text-xs" style={{ color: 'var(--text-primary)' }}>{memoryPercent.toFixed(0)}%</span>
            ) : (
              <span className="text-[10px] md:text-xs" style={{ color: 'var(--text-primary)' }}>{memoryUsed} MB</span>
            )}
          </div>
          <div className="h-1.5 md:h-2 bg-zetta-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: memoryTotal ? `${memoryPercent}%` : `${appBarWidth}%`, backgroundColor: 'var(--text-muted)' }}
            />
          </div>
          {memoryTotal && (
            <div className="text-[9px] md:text-[10px] mt-0.5 md:mt-1" style={{ color: 'var(--text-muted)' }}>
              {memoryUsed} / {memoryTotal} MB
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function StatsPanel({ stats, systemStats, appStats, devMode, timerStatus, activeProfileName }: StatsPanelProps) {
  return (
    <div className="p-2 md:p-3 lg:p-4 bg-zetta-card border border-zetta-border rounded-lg h-full flex flex-col gap-2 md:gap-3 overflow-auto">
      <h2 className="text-xs md:text-sm font-medium uppercase tracking-wider flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
        Statistics
      </h2>

      <div className="grid grid-cols-2 gap-1 md:gap-2 flex-shrink-0">
        <div className="p-2 md:p-3 bg-zetta-bg rounded-lg border border-zetta-border">
          <div className="text-base md:text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{stats.sessions_today}</div>
          <div className="text-[10px] md:text-xs" style={{ color: 'var(--text-muted)' }}>Sessions Today</div>
        </div>

        <div className="p-2 md:p-3 bg-zetta-bg rounded-lg border border-zetta-border">
          <div className="text-base md:text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{stats.total_focus_minutes}</div>
          <div className="text-[10px] md:text-xs" style={{ color: 'var(--text-muted)' }}>Total Focus (min)</div>
        </div>

        <div className="p-2 md:p-3 bg-zetta-bg rounded-lg border border-zetta-border">
          <div className="text-base md:text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{stats.current_streak}</div>
          <div className="text-[10px] md:text-xs" style={{ color: 'var(--text-muted)' }}>Current Streak</div>
        </div>

        <div className="p-2 md:p-3 bg-zetta-bg rounded-lg border border-zetta-border">
          <div className="text-base md:text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{stats.last_session_duration}</div>
          <div className="text-[10px] md:text-xs" style={{ color: 'var(--text-muted)' }}>Last Session (min)</div>
        </div>
      </div>

      {/* Dev Mode: Engine State Section */}
      {devMode && (
        <div className="p-2 md:p-3 bg-zetta-bg rounded-lg border border-yellow-500/30 flex-shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: '#ca8a04' }}>Engine State</span>
            <span className="px-1.5 py-0.5 text-[9px] bg-yellow-500/20 rounded" style={{ color: '#ca8a04' }}>DEV</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] md:text-xs">
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-muted)' }}>Timer:</span>
              <span style={{ color: 'var(--text-primary)' }} className="font-mono">{timerStatus || 'idle'}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-muted)' }}>Profile:</span>
              <span style={{ color: 'var(--text-primary)' }}>{activeProfileName || '-'}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <MonitorSection
          title="System Monitor"
          cpuUsage={systemStats.cpu_usage}
          memoryUsed={systemStats.memory_used}
          memoryTotal={systemStats.memory_total}
        />

        <MonitorSection
          title="App Monitor"
          cpuUsage={appStats.cpu_usage}
          memoryUsed={appStats.memory_used}
        />
      </div>
    </div>
  );
}

