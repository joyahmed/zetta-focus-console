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

  return (
    <div className="flex-1 p-3 bg-zetta-bg rounded-lg border border-zetta-border flex flex-col justify-between">
      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">
        {title}
      </div>
      <div className="space-y-2">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">CPU</span>
            <span className="text-xs text-gray-300">{cpuUsage.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-zetta-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-gray-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(cpuUsage, 100)}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">RAM</span>
            {memoryTotal ? (
              <span className="text-xs text-gray-300">{memoryPercent.toFixed(0)}%</span>
            ) : (
              <span className="text-xs text-gray-300">{memoryUsed} MB</span>
            )}
          </div>
          <div className="h-2 bg-zetta-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-gray-500 rounded-full transition-all duration-300"
              style={{ width: memoryTotal ? `${memoryPercent}%` : '100%' }}
            />
          </div>
          {memoryTotal && (
            <div className="text-[10px] text-gray-600 mt-1">
              {memoryUsed} / {memoryTotal} MB
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function StatsPanel({ stats, systemStats, appStats }: StatsPanelProps) {
  return (
    <div className="p-4 bg-zetta-card border border-zetta-border rounded-lg h-full flex flex-col gap-3">
      <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
        Statistics
      </h2>
      
      <div className="grid grid-cols-2 gap-2 flex-shrink-0">
        <div className="p-3 bg-zetta-bg rounded-lg border border-zetta-border">
          <div className="text-lg font-bold text-white">{stats.sessions_today}</div>
          <div className="text-xs text-gray-500">Sessions Today</div>
        </div>
        
        <div className="p-3 bg-zetta-bg rounded-lg border border-zetta-border">
          <div className="text-lg font-bold text-white">{stats.total_focus_minutes}</div>
          <div className="text-xs text-gray-500">Total Focus (min)</div>
        </div>
        
        <div className="p-3 bg-zetta-bg rounded-lg border border-zetta-border">
          <div className="text-lg font-bold text-white">{stats.current_streak}</div>
          <div className="text-xs text-gray-500">Current Streak</div>
        </div>
        
        <div className="p-3 bg-zetta-bg rounded-lg border border-zetta-border">
          <div className="text-lg font-bold text-white">{stats.last_session_duration}</div>
          <div className="text-xs text-gray-500">Last Session (min)</div>
        </div>
      </div>

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
  );
}
