import { useEffect, useState } from 'react';

export default function ProfileModal({
	isOpen,
	onClose,
	mode,
	profile,
	onSubmit
}: ProfileModalProps) {
	const [name, setName] = useState('');
	const [focusMin, setFocusMin] = useState(25);
	const [shortBreakMin, setShortBreakMin] = useState(5);
	const [longBreakMin, setLongBreakMin] = useState(15);
	const [season, setSeason] = useState('winter');
	const [intensity, setIntensity] = useState('low');
	const [sound, setSound] = useState('fireplace');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Populate form when editing
	useEffect(() => {
		if (mode === 'edit' && profile) {
			setName(profile.name);
			setFocusMin(profile.focus_duration / 60);
			setShortBreakMin(profile.short_break_duration / 60);
			setLongBreakMin(profile.long_break_duration / 60);
			setSeason(profile.season);
			setIntensity(profile.motion_intensity);
			// Extract sound name from filename (e.g., "fireplace.mp3" -> "fireplace")
			const soundName = profile.sound_file.replace('.mp3', '');
			setSound(soundName);
		} else if (mode === 'create') {
			// Reset to defaults for create mode
			setName('');
			setFocusMin(25);
			setShortBreakMin(5);
			setLongBreakMin(15);
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
				className='absolute inset-0 bg-black/60 backdrop-blur-sm'
				onClick={onClose}
			/>

			{/* Modal */}
			<div className='relative bg-zetta-card border border-zetta-border rounded-lg shadow-2xl w-[500px] max-h-[80vh] overflow-auto'>
				{/* Header */}
				<div className='flex items-center justify-between px-4 py-3 border-b border-zetta-border'>
					<h2 className='text-sm font-medium text-white'>{title}</h2>
					<button
						onClick={onClose}
						className='p-1 text-gray-400 hover:text-white transition-colors'
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
				<form onSubmit={handleSubmit} className='p-4 space-y-4'>
					{error && (
						<div className='p-2 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-xs'>
							{error}
						</div>
					)}

					{/* Profile Name */}
					<div>
						<label className='block text-xs text-gray-400 mb-1'>
							Profile Name
						</label>
						<input
							type='text'
							value={name}
							onChange={e => setName(e.target.value)}
							placeholder='My Custom Profile'
							className='w-full px-3 py-2 bg-zetta-bg border border-zetta-border rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500'
							autoFocus
						/>
						{mode === 'create' && (
							<p className='text-[10px] text-gray-600 mt-1'>
								ID will be auto-generated from the name
							</p>
						)}
						{mode === 'edit' && profile && (
							<p className='text-[10px] text-gray-600 mt-1'>
								ID: {profile.id}
							</p>
						)}
					</div>

					{/* Durations */}
					<div className='grid grid-cols-3 gap-4'>
						<div>
							<label className='block text-xs text-gray-400 mb-1'>
								Focus (min)
							</label>
							<input
								type='number'
								min={1}
								max={180}
								value={focusMin}
								onChange={e =>
									setFocusMin(parseInt(e.target.value) || 25)
								}
								className='w-full px-3 py-2 bg-zetta-bg border border-zetta-border rounded text-sm text-white focus:outline-none focus:border-gray-500'
							/>
						</div>
						<div>
							<label className='block text-xs text-gray-400 mb-1'>
								Short Break
							</label>
							<input
								type='number'
								min={1}
								max={60}
								value={shortBreakMin}
								onChange={e =>
									setShortBreakMin(parseInt(e.target.value) || 5)
								}
								className='w-full px-3 py-2 bg-zetta-bg border border-zetta-border rounded text-sm text-white focus:outline-none focus:border-gray-500'
							/>
						</div>
						<div>
							<label className='block text-xs text-gray-400 mb-1'>
								Long Break
							</label>
							<input
								type='number'
								min={1}
								max={60}
								value={longBreakMin}
								onChange={e =>
									setLongBreakMin(parseInt(e.target.value) || 15)
								}
								className='w-full px-3 py-2 bg-zetta-bg border border-zetta-border rounded text-sm text-white focus:outline-none focus:border-gray-500'
							/>
						</div>
					</div>

					{/* Season & Intensity */}
					<div className='grid grid-cols-2 gap-4'>
						<div>
							<label className='block text-xs text-gray-400 mb-1'>
								Season
							</label>
							<select
								value={season}
								onChange={e => setSeason(e.target.value)}
								className='w-full px-3 py-2 bg-zetta-bg border border-zetta-border rounded text-sm text-white focus:outline-none focus:border-gray-500'
							>
								<option value='winter'>Winter</option>
								<option value='spring'>Spring</option>
								<option value='summer'>Summer</option>
								<option value='autumn'>Autumn</option>
							</select>
						</div>
						<div>
							<label className='block text-xs text-gray-400 mb-1'>
								Motion Intensity
							</label>
							<select
								value={intensity}
								onChange={e => setIntensity(e.target.value)}
								className='w-full px-3 py-2 bg-zetta-bg border border-zetta-border rounded text-sm text-white focus:outline-none focus:border-gray-500'
							>
								<option value='low'>Low</option>
								<option value='medium'>Medium</option>
								<option value='high'>High</option>
							</select>
						</div>
					</div>

					{/* Sound */}
					<div>
						<label className='block text-xs text-gray-400 mb-1'>
							Ambient Sound
						</label>
						<select
							value={sound}
							onChange={e => setSound(e.target.value)}
							className='w-full px-3 py-2 bg-zetta-bg border border-zetta-border rounded text-sm text-white focus:outline-none focus:border-gray-500'
						>
							<option value='fireplace'>Fireplace</option>
							<option value='soft_rain'>Soft Rain</option>
							<option value='light_wind'>Light Wind</option>
							<option value='rain_window'>Rain on Window</option>
						</select>
					</div>

					{/* Actions */}
					<div className='flex justify-end gap-2 pt-2 border-t border-zetta-border'>
						<button
							type='button'
							onClick={onClose}
							className='px-4 py-2 text-xs text-gray-400 hover:text-white transition-colors'
						>
							Cancel
						</button>
						<button
							type='submit'
							disabled={isSubmitting}
							className={`px-4 py-2 text-xs text-white rounded transition-colors disabled:opacity-50 ${
								mode === 'edit'
									? 'bg-amber-500 hover:bg-amber-600'
									: 'bg-blue-500 hover:bg-blue-600'
							}`}
						>
							{isSubmitting ? submittingLabel : submitLabel}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
