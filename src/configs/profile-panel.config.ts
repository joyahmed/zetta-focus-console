export const getSeasonEmoji = (season: Profile['season']): string => {
	switch (season) {
		case 'spring':
			return '🌸';
		case 'summer':
			return '☀️';
		case 'autumn':
			return '🍂';
		case 'winter':
			return '❄️';
		default:
			return '❄️';
	}
};

export const getMotionLabel = (
	intensity: Profile['motion_intensity']
): string => {
	switch (intensity) {
		case 'low':
			return 'Low';
		case 'medium':
			return 'Medium';
		case 'high':
			return 'High';
		default:
			return 'Low';
	}
};

export const getMotionBar = (
	intensity: Profile['motion_intensity']
): number => {
	switch (intensity) {
		case 'low':
			return 1;
		case 'medium':
			return 2;
		case 'high':
			return 3;
		default:
			return 1;
	}
};
