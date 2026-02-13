import { Profile } from '../state';

interface ProfilePanelProps {
  profile: Profile;
}

function getSeasonEmoji(season: Profile['season']): string {
  switch (season) {
    case 'spring': return '🌸';
    case 'summer': return '☀️';
    case 'autumn': return '🍂';
    case 'winter': return '❄️';
    default: return '❄️';
  }
}

function getMotionLabel(intensity: Profile['motionIntensity']): string {
  switch (intensity) {
    case 'low': return 'Low';
    case 'medium': return 'Medium';
    case 'high': return 'High';
    default: return 'Low';
  }
}

function getMotionBar(intensity: Profile['motionIntensity']): number {
  switch (intensity) {
    case 'low': return 1;
    case 'medium': return 2;
    case 'high': return 3;
    default: return 1;
  }
}

export function ProfilePanel({ profile }: ProfilePanelProps) {
  return (
    <div className="p-6 bg-zetta-card border border-zetta-border rounded-lg">
      <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
        Active Profile
      </h2>
      
      <div className="flex items-center gap-3 mb-4">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
          style={{ backgroundColor: `${profile.glowColor}20` }}
        >
          {getSeasonEmoji(profile.season)}
        </div>
        <div>
          <div className="text-lg font-semibold text-white">{profile.name}</div>
          <div className="text-xs text-gray-500">ID: {profile.id}</div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">Season</span>
            <span className="text-white capitalize">{profile.season}</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">Motion Intensity</span>
            <span className="text-white">{getMotionLabel(profile.motionIntensity)}</span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3].map((level) => (
              <div
                key={level}
                className="h-1.5 flex-1 rounded-full transition-colors"
                style={{
                  backgroundColor: level <= getMotionBar(profile.motionIntensity) 
                    ? profile.glowColor 
                    : '#2a2f3a',
                }}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">Background</span>
            <span className="text-white capitalize">{profile.backgroundType}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-zetta-border">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <div className="text-gray-500">Focus</div>
              <div className="text-white">{profile.focusDuration / 60}m</div>
            </div>
            <div>
              <div className="text-gray-500">Short</div>
              <div className="text-white">{profile.shortBreakDuration / 60}m</div>
            </div>
            <div>
              <div className="text-gray-500">Long</div>
              <div className="text-white">{profile.longBreakDuration / 60}m</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-zetta-border">
        <div className="text-xs text-gray-500">
          Switch profile via terminal: <code className="text-zetta-border bg-zetta-bg px-1 py-0.5 rounded">profile [name]</code>
        </div>
      </div>
    </div>
  );
}
