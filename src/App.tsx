import { useState, useEffect, useCallback } from 'react';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { Header } from './components/Header';
import { TimerPanel } from './components/TimerPanel';
import { ProfilePanel } from './components/ProfilePanel';
import { TerminalPanel } from './components/TerminalPanel';
import { StatsPanel } from './components/StatsPanel';
import { SettingsPanel } from './components/SettingsPanel';

interface TimerState {
  remaining_seconds: number;
  total_seconds: number;
  status: 'idle' | 'running' | 'paused' | 'completed';
  session_type: 'focus' | 'short_break' | 'long_break';
}

interface Profile {
  id: string;
  name: string;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  motion_intensity: 'low' | 'medium' | 'high';
  background_type: 'gradient' | 'particles' | 'custom';
  focus_duration: number;
  short_break_duration: number;
  long_break_duration: number;
  glow_color: string;
}

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

interface AppState {
  timer: TimerState;
  active_profile: Profile;
  profiles: Profile[];
  stats: Stats;
  system_stats: SystemStats;
  app_stats: AppStats;
  dev_mode: boolean;
}

interface StateEvent {
  state: AppState;
}

function App() {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [terminalKey, setTerminalKey] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    invoke<AppState>('get_state').then((state) => {
      setAppState(state);
    }).catch(console.error);

    const unlisten = listen<StateEvent>('state-updated', (event) => {
      setAppState(event.payload.state);
    });

    return () => {
      unlisten.then(fn => fn());
    };
  }, []);

  useEffect(() => {
    if (!appState) return;
    
    const timerInterval = setInterval(() => {
      invoke('tick_timer').catch(console.error);
    }, 1000);
    
    const systemInterval = setInterval(() => {
      invoke('tick_system_stats').catch(console.error);
    }, 5000);
    
    return () => {
      clearInterval(timerInterval);
      clearInterval(systemInterval);
    };
  }, [appState?.timer.status]);

  const processCommand = useCallback(async (command: string): Promise<string> => {
    if (command === 'clear') {
      setTerminalKey(k => k + 1);
      return '';
    }
    
    try {
      const result = await invoke<string>('execute_command', { command });
      return result;
    } catch (error) {
      return `Error: ${error}`;
    }
  }, []);

  const handleProfileSwitch = useCallback(async (profileId: string) => {
    try {
      await invoke('execute_command', { command: `profile ${profileId}` });
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleDevModeToggle = useCallback(async () => {
    if (!appState) return;
    const cmd = appState.dev_mode ? 'devmode off' : 'devmode on';
    try {
      await invoke('execute_command', { command: cmd });
    } catch (error) {
      console.error(error);
    }
  }, [appState?.dev_mode]);

  if (!appState) {
    return (
      <div className="h-screen w-screen bg-zetta-bg flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-zetta-bg flex flex-col overflow-hidden">
      <Header 
        activeProfileName={appState.active_profile.name}
        devMode={appState.dev_mode}
        onSettingsClick={() => setSettingsOpen(true)}
      />
      
      <main className="flex-1 p-6 overflow-hidden">
        <div className="h-full grid grid-cols-2 grid-rows-2 gap-6">
          <div className="row-span-1">
            <TimerPanel 
              timer={appState.timer}
              glowColor={appState.active_profile.glow_color}
              onStart={() => processCommand('focus start 25')}
              onPause={() => processCommand('focus pause')}
              onResume={() => processCommand('focus resume')}
              onStop={() => processCommand('focus stop')}
            />
          </div>
          
          <div className="row-span-1">
            <ProfilePanel 
              profile={appState.active_profile}
              profiles={appState.profiles}
              onProfileSwitch={handleProfileSwitch}
            />
          </div>
          
          <div className="row-span-1">
            <TerminalPanel key={terminalKey} onCommand={processCommand} />
          </div>
          
          <div className="row-span-1">
            <StatsPanel stats={appState.stats} systemStats={appState.system_stats} appStats={appState.app_stats} />
          </div>
        </div>
      </main>

      <SettingsPanel 
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        devMode={appState.dev_mode}
        onDevModeToggle={handleDevModeToggle}
      />
    </div>
  );
}

export default App;
