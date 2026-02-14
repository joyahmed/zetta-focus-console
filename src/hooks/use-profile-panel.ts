interface UseProfilePanelProps {
	licenseType: string | undefined;
	trialDaysRemaining: number | null | undefined;
}

export const useProfilePanel = ({
	licenseType,
	trialDaysRemaining
}: UseProfilePanelProps) => {
	const getSeasonEmoji = (season: Profile['season']): string => {
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

	const getMotionLabel = (
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

	const getMotionBar = (
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

	const getLicenseBadge = () => {
		const type = licenseType || 'Free';
		const days = trialDaysRemaining ?? null;
		const isExpiring = days !== null && days <= 3;
		const isWarning = days !== null && days > 3 && days <= 7;

		if (type === 'Trial' && days !== null) {
			if (isExpiring) {
				return {
					label: `Trial ${days}d`,
					bg: 'rgba(245, 158, 11, 0.15)',
					text: '#f59e0b',
					border: 'rgba(245, 158, 11, 0.3)'
				};
			}
			if (isWarning) {
				return {
					label: `Trial ${days}d`,
					bg: 'rgba(234, 179, 8, 0.15)',
					text: '#ca8a04',
					border: 'rgba(234, 179, 8, 0.3)'
				};
			}
			return {
				label: `Trial ${days}d`,
				bg: 'rgba(34, 197, 94, 0.15)',
				text: '#22c55e',
				border: 'rgba(34, 197, 94, 0.3)'
			};
		}

		const badges: Record<
			string,
			{ label: string; bg: string; text: string; border: string }
		> = {
			Pro: {
				label: 'Pro',
				bg: 'rgba(59, 130, 246, 0.15)',
				text: '#3b82f6',
				border: 'rgba(59, 130, 246, 0.3)'
			},
			Founder: {
				label: 'Founder',
				bg: 'rgba(168, 85, 247, 0.15)',
				text: '#a855f7',
				border: 'rgba(168, 85, 247, 0.3)'
			},
			Free: {
				label: 'Free',
				bg: 'rgba(107, 114, 128, 0.1)',
				text: '#6b7280',
				border: 'rgba(107, 114, 128, 0.2)'
			}
		};

		return badges[type] || badges.Free;
	};

	const licenseBadge = getLicenseBadge();

	return {
		getSeasonEmoji,
		getMotionLabel,
		getMotionBar,
		licenseBadge
	};
};
