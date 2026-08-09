import { useEffect, useState } from 'react';
import { secondsToMinutes, stripExtension } from '../utils/format';

const DEFAULTS = {
	name: '',
	focusMin: 25,
	shortBreakMin: 5,
	longBreakMin: 15,
	sessionsPerCycle: 4,
	season: 'winter',
	intensity: 'low',
	sound: 'fireplace'
};

/**
 * The create/edit form.
 *
 * Ten pieces of state, a reset, a load and a submit — all of it was sitting in
 * the component above the markup, which is most of the reason that file ran to
 * four hundred lines.
 */
export const useProfileModal = ({
	isOpen,
	mode,
	profile,
	onClose,
	onSubmit
}: UseProfileModalProps) => {
	const [name, setName] = useState(DEFAULTS.name);
	const [focusMin, setFocusMin] = useState(DEFAULTS.focusMin);
	const [shortBreakMin, setShortBreakMin] = useState(DEFAULTS.shortBreakMin);
	const [longBreakMin, setLongBreakMin] = useState(DEFAULTS.longBreakMin);
	const [sessionsPerCycle, setSessionsPerCycle] = useState(
		DEFAULTS.sessionsPerCycle
	);
	const [season, setSeason] = useState(DEFAULTS.season);
	const [intensity, setIntensity] = useState(DEFAULTS.intensity);
	const [sound, setSound] = useState(DEFAULTS.sound);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Duplicate seeds from the profile exactly as edit does; the only
		// differences are the name it suggests and that it submits without an
		// id, so the engine creates rather than updates.
		if ((mode === 'edit' || mode === 'duplicate') && profile) {
			setName(
				mode === 'duplicate' ? `${profile.name} Copy` : profile.name
			);
			setFocusMin(secondsToMinutes(profile.focus_duration));
			setShortBreakMin(secondsToMinutes(profile.short_break_duration));
			setLongBreakMin(secondsToMinutes(profile.long_break_duration));
			setSessionsPerCycle(profile.sessions_per_cycle || 4);
			setSeason(profile.season);
			setIntensity(profile.motion_intensity);
			setSound(stripExtension(profile.sound_file));
		} else if (mode === 'create') {
			setName(DEFAULTS.name);
			setFocusMin(DEFAULTS.focusMin);
			setShortBreakMin(DEFAULTS.shortBreakMin);
			setLongBreakMin(DEFAULTS.longBreakMin);
			setSessionsPerCycle(DEFAULTS.sessionsPerCycle);
			setSeason(DEFAULTS.season);
			setIntensity(DEFAULTS.intensity);
			setSound(DEFAULTS.sound);
		}
		setError(null);
	}, [mode, profile, isOpen]);

	/** The four steppers, as data. Three of them are minute durations with
	    identical bounds; only the label, the value and its setter differ. */
	const intervals: NumberInputProps[] = [
		{
			label: 'Focus',
			unit: 'min',
			value: focusMin,
			onChange: setFocusMin,
			min: 0.5,
			max: 180,
			step: 0.5,
			precision: 2
		},
		{
			label: 'Short',
			unit: 'min',
			value: shortBreakMin,
			onChange: setShortBreakMin,
			min: 0.5,
			max: 60,
			step: 0.5,
			precision: 2
		},
		{
			label: 'Long',
			unit: 'min',
			value: longBreakMin,
			onChange: setLongBreakMin,
			min: 0.5,
			max: 60,
			step: 0.5,
			precision: 2
		},
		{
			label: 'Sessions',
			value: sessionsPerCycle,
			onChange: setSessionsPerCycle,
			min: 1,
			max: 20,
			step: 1,
			precision: 0
		}
	];

	const handleSubmit = async (e: React.SubmitEvent) => {
		e.preventDefault();
		setError(null);

		if (!name.trim()) {
			setError('Profile name is required');
			return;
		}

		setIsSubmitting(true);
		try {
			const result = await onSubmit({
				// Duplicate deliberately sends no id, so this saves as a new profile.
				id: mode === 'edit' ? profile?.id : undefined,
				name: name.trim(),
				focus_min: focusMin,
				short_break_min: shortBreakMin,
				long_break_min: longBreakMin,
				sessions_per_cycle: sessionsPerCycle,
				season,
				intensity,
				sound
			});

			if (result.startsWith('Error:')) {
				setError(result.replace('Error: ', ''));
			} else {
				onClose();
			}
		} catch (err) {
			setError(String(err));
		}
		setIsSubmitting(false);
	};

	return {
		name,
		setName,
		season,
		setSeason,
		intensity,
		setIntensity,
		sound,
		setSound,
		intervals,
		isSubmitting,
		error,
		handleSubmit
	};
};
