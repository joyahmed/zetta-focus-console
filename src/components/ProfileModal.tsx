import { useEffect, useState } from 'react';
import LabelledSelect from './profile-modal/LabelledSelect';
import NumberInput from './profile-modal/NumberInput';

/** Everything the three dropdowns offer. They were twelve hand-written
    <option> tags across three <select>s; adding a soundscape meant finding the
    right block rather than adding a line. */
const SEASONS: SelectOption[] = [
	{ value: 'winter', label: '❄️ Winter' },
	{ value: 'spring', label: '🌸 Spring' },
	{ value: 'summer', label: '☀️ Summer' },
	{ value: 'autumn', label: '🍂 Autumn' }
];

const INTENSITIES: SelectOption[] = [
	{ value: 'low', label: 'Low' },
	{ value: 'medium', label: 'Medium' },
	{ value: 'high', label: 'High' }
];

const SOUNDS: SelectOption[] = [
	{ value: 'fireplace', label: '🔥 Fireplace Crackling' },
	{ value: 'soft_rain', label: '🌧️ Soft Rain' },
	{ value: 'light_wind', label: '💨 Light Wind' },
	{ value: 'rain_window', label: '☔ Rain on Window' }
];

const ProfileModal = ({
	isOpen,
	onClose,
	mode,
	profile,
	onSubmit
}: ProfileModalProps) => {
	const [name, setName] = useState('');
	const [focusMin, setFocusMin] = useState(25);
	const [shortBreakMin, setShortBreakMin] = useState(5);
	const [longBreakMin, setLongBreakMin] = useState(15);
	const [sessionsPerCycle, setSessionsPerCycle] = useState(4);
	const [season, setSeason] = useState('winter');
	const [intensity, setIntensity] = useState('low');
	const [sound, setSound] = useState('fireplace');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const secondsToMinutes = (seconds: number) =>
		Number((seconds / 60).toFixed(2));

	/** The four steppers, as data. Three of them are minute durations with
	    identical bounds; only the label, the value and its setter differ. */
	const intervals: NumberInputProps[] = [
		{
			label: 'Focus',
			value: focusMin,
			onChange: setFocusMin,
			min: 0.5,
			max: 180,
			step: 0.5,
			precision: 2
		},
		{
			label: 'Short',
			value: shortBreakMin,
			onChange: setShortBreakMin,
			min: 0.5,
			max: 60,
			step: 0.5,
			precision: 2
		},
		{
			label: 'Long',
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

	// Populate form when editing
	useEffect(() => {
		if (mode === 'edit' && profile) {
			setName(profile.name);
			setFocusMin(secondsToMinutes(profile.focus_duration));
			setShortBreakMin(secondsToMinutes(profile.short_break_duration));
			setLongBreakMin(secondsToMinutes(profile.long_break_duration));
			setSessionsPerCycle(profile.sessions_per_cycle || 4);
			setSeason(profile.season);
			setIntensity(profile.motion_intensity);
			// Extract sound name from filename (e.g. "fireplace.ogg" -> "fireplace").
			// Any extension, because profiles saved before the switch to Vorbis
			// still say ".mp3" and must still select the right option.
			const soundName = profile.sound_file.replace(/\.[^.]+$/, '');
			setSound(soundName);
		} else if (mode === 'create') {
			// Reset to defaults for create mode
			setName('');
			setFocusMin(25);
			setShortBreakMin(5);
			setLongBreakMin(15);
			setSessionsPerCycle(4);
			setSeason('winter');
			setIntensity('low');
			setSound('fireplace');
		}
		setError(null);
	}, [mode, profile, isOpen]);

	const handleSubmit = async (e: React.SubmitEvent) => {
		e.preventDefault();
		setError(null);

		// Validate name
		if (!name.trim()) {
			setError('Profile name is required');
			return;
		}

		setIsSubmitting(true);
		try {
			const result = await onSubmit({
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

	if (!isOpen) return null;

	const title =
		mode === 'create' ? 'Create Custom Profile' : 'Edit Profile';
	const submitLabel =
		mode === 'create' ? 'Create Profile' : 'Save Changes';
	const submittingLabel =
		mode === 'create' ? 'Creating...' : 'Saving...';

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center'>
			{/* Backdrop */}
			<div
				className='absolute inset-0 bg-black/50 backdrop-blur-sm'
				onClick={onClose}
			/>

			{/* Modal */}
			<div className='profile-modal-white relative bg-zetta-card backdrop-blur-xl border border-zetta-border rounded-lg shadow-2xl w-[500px] max-h-[80vh] overflow-auto custom-scrollbar'>
				{/* Header */}
				<div className='profile-modal-white flex items-center justify-between px-5 py-4 border-b border-zetta-border bg-zetta-card/90 backdrop-blur sticky top-0 z-10'>
					<h2 className='text-base font-semibold text-zetta-text tracking-tight'>
						{title}
					</h2>
					<button
						onClick={onClose}
						className='p-1.5 rounded-md text-zetta-text-secondary hover:text-zetta-text hover:bg-zetta-bg transition-all'
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							className='h-4 w-4'
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M6 18L18 6M6 6l12 12'
							/>
						</svg>
					</button>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className='p-5 space-y-5'>
					{error && (
						<div className='p-3 bg-red-500/15 border border-red-500/30 rounded-md text-red-400 text-xs flex items-center gap-2'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								viewBox='0 0 20 20'
								fill='currentColor'
								className='w-4 h-4 shrink-0'
							>
								<path
									fillRule='evenodd'
									d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
									clipRule='evenodd'
								/>
							</svg>
							{error}
						</div>
					)}

					{/* Profile Name */}
					<div>
						<h3 className='text-xs font-semibold text-zetta-text-muted uppercase tracking-wider mb-2'>
							Identity
						</h3>
						<div className='profile-modal-white bg-zetta-panel rounded-lg p-3 border border-zetta-border'>
							<label className='block text-xs text-zetta-text-secondary mb-1.5 font-medium'>
								Profile Name
							</label>
							<input
								type='text'
								value={name}
								onChange={e => setName(e.target.value)}
								placeholder='My Custom Profile'
								className='profile-modal-white w-full px-3 py-2 bg-zetta-bg border border-zetta-border rounded text-sm text-zetta-text placeholder-zetta-text-muted focus:outline-none focus:border-zetta-neon focus:ring-1 focus:ring-zetta-neon/30 transition-all font-medium'
								autoFocus
							/>
							{mode === 'create' && (
								<p className='text-[10px] text-zetta-text-muted mt-1.5 flex items-center gap-1.5'>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										viewBox='0 0 20 20'
										fill='currentColor'
										className='w-3 h-3'
									>
										<path
											fillRule='evenodd'
											d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
											clipRule='evenodd'
										/>
									</svg>
									ID will be auto-generated from the name
								</p>
							)}
							{mode === 'edit' && profile && (
								<p className='text-[10px] text-zetta-text-muted mt-1.5 flex items-center gap-1.5 font-mono'>
									<span className='profile-modal-white px-1.5 py-0.5 bg-zetta-bg border border-zetta-border rounded text-[10px]'>
										ID
									</span>
									<span className='text-zetta-text-secondary'>
										{profile.id}
									</span>
								</p>
							)}
						</div>
					</div>

					{/* Durations */}
					<div>
						<h3 className='text-xs font-semibold text-zetta-text-muted uppercase tracking-wider mb-2'>
							Time Intervals
						</h3>
						<div className='profile-modal-white grid grid-cols-4 gap-2 bg-zetta-panel rounded-lg p-3 border border-zetta-border'>
							{intervals.map(interval => (
								<NumberInput key={interval.label} {...interval} />
							))}
						</div>
					</div>

					{/* Ambience */}
					<div>
						<h3 className='text-xs font-semibold text-zetta-text-muted uppercase tracking-wider mb-2'>
							Ambience Configuration
						</h3>

						<div className='profile-modal-white bg-zetta-panel rounded-lg p-3 space-y-3 border border-zetta-border'>
							{/* Season & Intensity */}
							<div className='grid grid-cols-2 gap-3'>
								<LabelledSelect
									{...{
										label: 'Seasonal Theme',
										value: season,
										options: SEASONS,
										onChange: setSeason
									}}
								/>
								<LabelledSelect
									{...{
										label: 'Motion Intensity',
										value: intensity,
										options: INTENSITIES,
										onChange: setIntensity
									}}
								/>
							</div>

							{/* Sound */}
							<LabelledSelect
								{...{
									label: 'Ambient Soundscape',
									value: sound,
									options: SOUNDS,
									onChange: setSound
								}}
							/>
						</div>
					</div>

					{/* Actions */}
					<div className='flex justify-end gap-3 pt-4 border-t border-zetta-border'>
						<button
							type='button'
							onClick={onClose}
							className='px-4 py-2 text-xs font-medium text-zetta-text-secondary hover:text-zetta-text transition-colors hover:bg-zetta-panel rounded-md'
						>
							Cancel
						</button>
						<button
							type='submit'
							disabled={isSubmitting}
							className={`px-5 py-2 text-xs font-medium text-white rounded-md shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
								mode === 'edit'
									? 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20'
									: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'
							}`}
						>
							{isSubmitting ? submittingLabel : submitLabel}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ProfileModal;
