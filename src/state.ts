export interface TimerState {
  remainingSeconds: number;
  totalSeconds: number;
  status: 'idle' | 'running' | 'paused' | 'completed';
  sessionType: 'focus' | 'short_break' | 'long_break';
}

export interface Profile {
  id: string;
  name: string;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  motionIntensity: 'low' | 'medium' | 'high';
  backgroundType: 'gradient' | 'particles' | 'custom';
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  glowColor: string;
}

export interface Stats {
  sessionsToday: number;
  totalFocusMinutes: number;
  currentStreak: number;
  lastSessionDuration: number;
}

export interface AppState {
  timer: TimerState;
  activeProfile: Profile;
  profiles: Profile[];
  stats: Stats;
  devMode: boolean;
}

export const defaultProfile: Profile = {
  id: 'winter-deep',
  name: 'Winter Deep',
  season: 'winter',
  motionIntensity: 'low',
  backgroundType: 'gradient',
  focusDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  glowColor: '#60a5fa',
};

export const mockProfiles: Profile[] = [
  defaultProfile,
  {
    id: 'summer-energy',
    name: 'Summer Energy',
    season: 'summer',
    motionIntensity: 'high',
    backgroundType: 'particles',
    focusDuration: 25 * 60,
    shortBreakDuration: 5 * 60,
    longBreakDuration: 15 * 60,
    glowColor: '#fbbf24',
  },
  {
    id: 'spring-bloom',
    name: 'Spring Bloom',
    season: 'spring',
    motionIntensity: 'medium',
    backgroundType: 'gradient',
    focusDuration: 25 * 60,
    shortBreakDuration: 5 * 60,
    longBreakDuration: 15 * 60,
    glowColor: '#34d399',
  },
  {
    id: 'autumn-calm',
    name: 'Autumn Calm',
    season: 'autumn',
    motionIntensity: 'low',
    backgroundType: 'gradient',
    focusDuration: 25 * 60,
    shortBreakDuration: 5 * 60,
    longBreakDuration: 15 * 60,
    glowColor: '#f97316',
  },
];

export const mockState: AppState = {
  timer: {
    remainingSeconds: 25 * 60,
    totalSeconds: 25 * 60,
    status: 'idle',
    sessionType: 'focus',
  },
  activeProfile: defaultProfile,
  profiles: mockProfiles,
  stats: {
    sessionsToday: 4,
    totalFocusMinutes: 100,
    currentStreak: 7,
    lastSessionDuration: 25,
  },
  devMode: false,
};
