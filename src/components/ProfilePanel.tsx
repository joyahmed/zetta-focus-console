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
  is_preset: boolean;
}

interface ProfilePanelProps {
  profile: Profile;
  profiles: Profile[];
  onProfileSwitch: (profileId: string) => void;
  onCreateProfile?: () => void;
  onEditProfile?: () => void;
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

function getMotionLabel(intensity: Profile['motion_intensity']): string {
  switch (intensity) {
    case 'low': return 'Low';
    case 'medium': return 'Medium';
    case 'high': return 'High';
    default: return 'Low';
  }
}

function getMotionBar(intensity: Profile['motion_intensity']): number {
  switch (intensity) {
    case 'low': return 1;
    case 'medium': return 2;
    case 'high': return 3;
    default: return 1;
  }
}

export function ProfilePanel({ profile, profiles, onProfileSwitch, onCreateProfile, onEditProfile }: ProfilePanelProps) {
  const otherProfiles = profiles.filter(p => p.id !== profile.id);

  return (
    <div className="p-3 md:p-4 lg:p-6 bg-zetta-card border border-zetta-border rounded-lg h-full overflow-auto">
      <h2 className="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider mb-2 md:mb-4">
        Active Profile
      </h2>

      <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
        <div
          className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-base md:text-xl"
          style={{ backgroundColor: `${profile.glow_color}20` }}
        >
          {getSeasonEmoji(profile.season)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm md:text-lg font-semibold text-white">{profile.name}</span>
            {profile.is_preset ? (
              <span className="px-1.5 py-0.5 text-[9px] bg-blue-500/20 text-blue-400 rounded">PRESET</span>
            ) : (
              <span className="px-1.5 py-0.5 text-[9px] bg-green-500/20 text-green-400 rounded">CUSTOM</span>
            )}
          </div>
          <div className="text-[10px] md:text-xs text-gray-500">ID: {profile.id}</div>
        </div>
      </div>

      <div className="space-y-2 md:space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">Season</span>
            <span className="text-white capitalize">{profile.season}</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">Motion Intensity</span>
            <span className="text-white">{getMotionLabel(profile.motion_intensity)}</span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3].map((level) => (
              <div
                key={level}
                className="h-1.5 flex-1 rounded-full transition-colors"
                style={{
                  backgroundColor: level <= getMotionBar(profile.motion_intensity)
                    ? profile.glow_color
                    : '#2a2f3a',
                }}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">Background</span>
            <span className="text-white capitalize">{profile.background_type}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-zetta-border">
          <div className="grid grid-cols-3 gap-1 md:gap-2 text-xs">
            <div>
              <div className="text-gray-500">Focus</div>
              <div className="text-white">{profile.focus_duration / 60}m</div>
            </div>
            <div>
              <div className="text-gray-500">Short</div>
              <div className="text-white">{profile.short_break_duration / 60}m</div>
            </div>
            <div>
              <div className="text-gray-500">Long</div>
              <div className="text-white">{profile.long_break_duration / 60}m</div>
            </div>
          </div>
        </div>
      </div>

      {otherProfiles.length > 0 && (
        <div className="mt-2 md:mt-4 pt-2 md:pt-4 border-t border-zetta-border">
          <div className="text-xs text-gray-500 mb-1 md:mb-2">Quick Switch</div>
          <div className="flex flex-wrap gap-1">
            {otherProfiles.map(p => (
              <button
                key={p.id}
                onClick={() => onProfileSwitch(p.id)}
                className="px-1.5 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs bg-zetta-bg border border-zetta-border rounded hover:border-gray-500 transition-colors text-gray-300"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create Profile Button */}
      {onCreateProfile && (
        <div className="mt-2 md:mt-4 pt-2 md:pt-4 border-t border-zetta-border">
          <button
            onClick={onCreateProfile}
            className="w-full px-3 py-2 text-xs bg-zetta-bg border border-zetta-border rounded hover:border-blue-500/50 hover:bg-blue-500/10 transition-colors text-gray-300 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Custom Profile
          </button>
        </div>
      )}

      {/* Edit Profile Button - only for custom profiles */}
      {onEditProfile && !profile.is_preset && (
        <div className="mt-2">
          <button
            onClick={onEditProfile}
            className="w-full px-3 py-2 text-xs bg-zetta-bg border border-zetta-border rounded hover:border-amber-500/50 hover:bg-amber-500/10 transition-colors text-gray-300 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
}
