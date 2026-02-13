import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { TimerPanel } from './components/TimerPanel';
import { ProfilePanel } from './components/ProfilePanel';
import { TerminalPanel } from './components/TerminalPanel';
import { StatsPanel } from './components/StatsPanel';
import { AppState, mockState } from './state';
import { handleCommand } from './commands';

function App() {
  const [appState, setAppState] = useState<AppState>(mockState);
  const [terminalKey, setTerminalKey] = useState(0);

  const processCommand = useCallback((command: string): string => {
    if (command === 'clear') {
      setTerminalKey(k => k + 1);
      return '';
    }
    
    const result = handleCommand(command, appState);
    
    if (result.includes('Switched to profile:')) {
      const parts = command.split(' ');
      const profileId = parts[1];
      const profile = mockState.profiles.find(p => p.id === profileId);
      if (profile) {
        setAppState(prev => ({ ...prev, activeProfile: profile }));
      }
    }
    
    if (result.includes('focus start')) {
      const parts = command.split(' ');
      const minutes = parts[2] ? parseInt(parts[2]) : 25;
      const totalSeconds = minutes * 60;
      setAppState(prev => ({
        ...prev,
        timer: {
          ...prev.timer,
          remainingSeconds: totalSeconds,
          totalSeconds: totalSeconds,
          status: 'running',
        }
      }));
    }
    
    if (command === 'focus stop') {
      setAppState(prev => ({
        ...prev,
        timer: {
          ...prev.timer,
          status: 'idle',
          remainingSeconds: prev.activeProfile.focusDuration,
        }
      }));
    }
    
    if (command === 'focus pause') {
      setAppState(prev => ({
        ...prev,
        timer: {
          ...prev.timer,
          status: 'paused',
        }
      }));
    }
    
    if (command === 'focus resume') {
      setAppState(prev => ({
        ...prev,
        timer: {
          ...prev.timer,
          status: 'running',
        }
      }));
    }
    
    if (command.includes('devmode on')) {
      setAppState(prev => ({ ...prev, devMode: true }));
    }
    
    if (command.includes('devmode off')) {
      setAppState(prev => ({ ...prev, devMode: false }));
    }
    
    return result;
  }, [appState]);

  useEffect(() => {
    if (appState.timer.status !== 'running') return;
    
    const interval = setInterval(() => {
      setAppState(prev => {
        if (prev.timer.remainingSeconds <= 0) {
          return {
            ...prev,
            timer: {
              ...prev.timer,
              status: 'completed',
              remainingSeconds: 0,
            },
            stats: {
              ...prev.stats,
              sessionsToday: prev.stats.sessionsToday + 1,
              totalFocusMinutes: prev.stats.totalFocusMinutes + Math.floor(prev.timer.totalSeconds / 60),
              lastSessionDuration: Math.floor(prev.timer.totalSeconds / 60),
            }
          };
        }
        return {
          ...prev,
          timer: {
            ...prev.timer,
            remainingSeconds: prev.timer.remainingSeconds - 1,
          }
        };
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [appState.timer.status]);

  return (
    <div className="h-screen w-screen bg-zetta-bg flex flex-col overflow-hidden">
      <Header 
        activeProfileName={appState.activeProfile.name}
        devMode={appState.devMode}
      />
      
      <main className="flex-1 p-6 overflow-hidden">
        <div className="h-full grid grid-cols-2 grid-rows-2 gap-6">
          <div className="row-span-1">
            <TimerPanel 
              timer={appState.timer}
              glowColor={appState.activeProfile.glowColor}
              onStart={() => processCommand('focus start 25')}
              onPause={() => processCommand('focus pause')}
              onResume={() => processCommand('focus resume')}
              onStop={() => processCommand('focus stop')}
            />
          </div>
          
          <div className="row-span-1">
            <ProfilePanel profile={appState.activeProfile} />
          </div>
          
          <div className="row-span-1">
            <TerminalPanel key={terminalKey} onCommand={processCommand} />
          </div>
          
          <div className="row-span-1">
            <StatsPanel stats={appState.stats} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
