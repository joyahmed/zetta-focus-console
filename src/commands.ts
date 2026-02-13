import { AppState, Profile, mockProfiles } from './state';

export type CommandHandler = (command: string, state: AppState) => { output: string; newState?: Partial<AppState> };

export function handleCommand(command: string, state: AppState): string {
  const parts = command.toLowerCase().split(/\s+/);
  const cmd = parts[0];
  const args = parts.slice(1);

  switch (cmd) {
    case 'help':
      return `Available commands:
  focus start [minutes]  - Start a focus session (default: 25 min)
  focus stop             - Stop current session
  focus pause            - Pause current session
  focus resume           - Resume paused session
  profile [name]        - Switch to a profile
  profile list           - List all available profiles
  season [name]          - Change season (spring/summer/autumn/winter)
  config show            - Show current configuration
  stats                  - Show detailed statistics
  devmode on/off         - Toggle developer mode
  clear                  - Clear terminal
  help                   - Show this help message`;

    case 'focus':
      if (args[0] === 'start') {
        const minutes = args[1] ? parseInt(args[1]) : 25;
        if (isNaN(minutes) || minutes <= 0) {
          return 'Error: Invalid duration. Usage: focus start [minutes]';
        }
        return `Starting focus session for ${minutes} minutes...`;
      } else if (args[0] === 'stop') {
        if (state.timer.status === 'idle') {
          return 'Error: No active session to stop.';
        }
        return 'Focus session stopped.';
      } else if (args[0] === 'pause') {
        if (state.timer.status !== 'running') {
          return 'Error: No running session to pause.';
        }
        return 'Focus session paused.';
      } else if (args[0] === 'resume') {
        if (state.timer.status !== 'paused') {
          return 'Error: No paused session to resume.';
        }
        return 'Focus session resumed.';
      }
      return 'Error: Unknown focus command. Usage: focus start [minutes] | stop | pause | resume';

    case 'profile':
      if (args[0] === 'list') {
        return `Available profiles:\n${mockProfiles.map((p: Profile) => `  ${p.id} - ${p.name}`).join('\n')}`;
      }
      if (!args[0]) {
        return `Current profile: ${state.activeProfile.id}\nUse "profile list" to see all profiles.`;
      }
      const found = mockProfiles.find((p: Profile) => p.id === args[0]);
      if (!found) {
        return `Error: Profile "${args[0]}" not found. Use "profile list" to see available profiles.`;
      }
      return `Switched to profile: ${found.name}`;

    case 'season':
      const validSeasons = ['spring', 'summer', 'autumn', 'winter'];
      if (!args[0]) {
        return `Current season: ${state.activeProfile.season}`;
      }
      if (!validSeasons.includes(args[0])) {
        return `Error: Invalid season. Choose from: ${validSeasons.join(', ')}`;
      }
      return `Season set to: ${args[0]}`;

    case 'config':
      if (args[0] === 'show') {
        return `Current Configuration:
  Profile: ${state.activeProfile.name}
  Season: ${state.activeProfile.season}
  Motion: ${state.activeProfile.motionIntensity}
  Background: ${state.activeProfile.backgroundType}
  Focus: ${state.activeProfile.focusDuration / 60} min
  Short Break: ${state.activeProfile.shortBreakDuration / 60} min
  Long Break: ${state.activeProfile.longBreakDuration / 60} min`;
      }
      return 'Error: Unknown config command. Usage: config show';

    case 'stats':
      return `Statistics:
  Sessions Today: ${state.stats.sessionsToday}
  Total Focus: ${state.stats.totalFocusMinutes} minutes
  Current Streak: ${state.stats.currentStreak} days
  Last Session: ${state.stats.lastSessionDuration} minutes`;

    case 'devmode':
      if (args[0] === 'on') return 'Developer mode enabled.';
      if (args[0] === 'off') return 'Developer mode disabled.';
      return 'Error: Usage: devmode on | off';

    case 'clear':
      return '__CLEAR__';

    case '':
      return '';

    default:
      return `Error: Unknown command "${cmd}". Type "help" for available commands.`;
  }
}
