/**
 * Profile lookups.
 *
 * These were three switch statements inside a `useProfilePanel` hook that held
 * no state and subscribed to nothing — it rebuilt the same three pure functions
 * on every render, and a switch that returns a constant per case is a table
 * written the long way. Winter and Low are the fallbacks, as they were.
 */

const SEASON_EMOJI: Record<Profile['season'], string> = {
	spring: '🌸',
	summer: '☀️',
	autumn: '🍂',
	winter: '❄️'
};

const MOTION_LABEL: Record<Profile['motion_intensity'], string> = {
	low: 'Low',
	medium: 'Medium',
	high: 'High'
};

const MOTION_BARS: Record<Profile['motion_intensity'], number> = {
	low: 1,
	medium: 2,
	high: 3
};

export const getSeasonEmoji = (season: Profile['season']): string =>
	SEASON_EMOJI[season] ?? SEASON_EMOJI.winter;

export const getMotionLabel = (
	intensity: Profile['motion_intensity']
): string => MOTION_LABEL[intensity] ?? MOTION_LABEL.low;

export const getMotionBar = (
	intensity: Profile['motion_intensity']
): number => MOTION_BARS[intensity] ?? MOTION_BARS.low;
