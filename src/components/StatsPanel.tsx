import { Stats } from '../state';

interface StatsPanelProps {
  stats: Stats;
}

export function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <div className="p-6 bg-zetta-card border border-zetta-border rounded-lg">
      <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
        Statistics
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-zetta-bg rounded-lg border border-zetta-border hover:border-gray-500 transition-all duration-200 hover:shadow-lg hover:shadow-black/20 group cursor-default">
          <div className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">{stats.sessionsToday}</div>
          <div className="text-xs text-gray-500 mt-1">Sessions Today</div>
        </div>
        
        <div className="p-4 bg-zetta-bg rounded-lg border border-zetta-border hover:border-gray-500 transition-all duration-200 hover:shadow-lg hover:shadow-black/20 group cursor-default">
          <div className="text-2xl font-bold text-white group-hover:text-green-400 transition-colors">{stats.totalFocusMinutes}</div>
          <div className="text-xs text-gray-500 mt-1">Total Focus (min)</div>
        </div>
        
        <div className="p-4 bg-zetta-bg rounded-lg border border-zetta-border hover:border-gray-500 transition-all duration-200 hover:shadow-lg hover:shadow-black/20 group cursor-default">
          <div className="text-2xl font-bold text-white group-hover:text-yellow-400 transition-colors">{stats.currentStreak}</div>
          <div className="text-xs text-gray-500 mt-1">Current Streak</div>
        </div>
        
        <div className="p-4 bg-zetta-bg rounded-lg border border-zetta-border hover:border-gray-500 transition-all duration-200 hover:shadow-lg hover:shadow-black/20 group cursor-default">
          <div className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors">{stats.lastSessionDuration}</div>
          <div className="text-xs text-gray-500 mt-1">Last Session (min)</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-zetta-border">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">All stats are synced from Rust engine</span>
        </div>
      </div>
    </div>
  );
}
