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
			<div className='relative bg-white dark:bg-zetta-card dark:backdrop-blur-xl border border-zetta-border rounded-lg shadow-2xl w-[500px] max-h-[80vh] overflow-auto custom-scrollbar'>
				{/* Header */}
				<div className='flex items-center justify-between px-5 py-4 border-b border-zetta-border bg-zetta-card/50 backdrop-blur sticky top-0 z-10'>
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
				<form onSubmit={handleSubmit} className='p-5 space-y-6'>
					{error && (
						<div className='p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-xs flex items-center gap-2'>
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
						<h3 className='text-xs font-semibold text-zetta-text-muted uppercase tracking-wider mb-3'>
							Identity
						</h3>
						<div className='bg-zetta-bg/50 backdrop-blur-sm rounded-lg p-3 border border-zetta-border/50'>
							<label className='block text-xs text-zetta-text-secondary mb-1.5 font-medium'>
								Profile Name
							</label>
							<input
								type='text'
								value={name}
								onChange={e => setName(e.target.value)}
								placeholder='My Custom Profile'
								className='w-full px-3 py-2 bg-zetta-card border border-zetta-border rounded text-sm text-zetta-text placeholder-zetta-text-muted focus:outline-none focus:border-zetta-text-secondary focus:ring-1 focus:ring-zetta-text-secondary/20 transition-all font-medium'
								autoFocus
							/>
							{mode === 'create' && (
								<p className='text-[10px] text-zetta-text-muted mt-1.5 flex items-center gap-1.5 opacity-80'>
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
								<p className='text-[10px] text-zetta-text-muted mt-1.5 flex items-center gap-1.5 opacity-80 font-mono'>
									<span className='px-1 bg-zetta-bg border border-zetta-border rounded'>
										ID
									</span>
									{profile.id}
								</p>
							)}
						</div>
					</div>

					{/* Durations */}
					<div>
						<h3 className='text-xs font-semibold text-zetta-text-muted uppercase tracking-wider mb-3 mt-2'>
							Time Intervals
						</h3>
						<div className='grid grid-cols-3 gap-4 bg-zetta-bg/50 backdrop-blur-sm rounded-lg p-3 border border-zetta-border/50'>
							<div>
								<label className='block text-xs text-zetta-text-secondary mb-1.5 font-medium'>
									Focus (min)
								</label>
								<input
									type='number'
									min={1}
									max={180}
									value={focusMin}
									onChange={e =>
										setFocusMin(
											parseInt(e.target.value) || 25
										)
									}
									className='w-full px-3 py-2 bg-zetta-card border border-zetta-border rounded text-sm text-zetta-text focus:outline-none focus:border-zetta-text-secondary focus:ring-1 focus:ring-zetta-text-secondary/20 transition-all text-center font-mono'
								/>
							</div>
							<div>
								<label className='block text-xs text-zetta-text-secondary mb-1.5 font-medium'>
									Short Break
								</label>
								<input
									type='number'
									min={1}
									max={60}
									value={shortBreakMin}
									onChange={e =>
										setShortBreakMin(
											parseInt(e.target.value) || 5
										)
									}
									className='w-full px-3 py-2 bg-zetta-card border border-zetta-border rounded text-sm text-zetta-text focus:outline-none focus:border-zetta-text-secondary focus:ring-1 focus:ring-zetta-text-secondary/20 transition-all text-center font-mono'
								/>
							</div>
							<div>
								<label className='block text-xs text-zetta-text-secondary mb-1.5 font-medium'>
									Long Break
								</label>
								<input
									type='number'
									min={1}
									max={60}
									value={longBreakMin}
									onChange={e =>
										setLongBreakMin(
											parseInt(e.target.value) || 15
										)
									}
									className='w-full px-3 py-2 bg-zetta-card border border-zetta-border rounded text-sm text-zetta-text focus:outline-none focus:border-zetta-text-secondary focus:ring-1 focus:ring-zetta-text-secondary/20 transition-all text-center font-mono'
								/>
							</div>
						</div>
					</div>

					<h3 className='text-xs font-semibold text-zetta-text-muted uppercase tracking-wider mb-3 mt-1'>
						Ambience Configuraiton
					</h3>

					<div className='bg-zetta-bg/50 backdrop-blur-sm rounded-lg p-3 space-y-4 border border-zetta-border/50'>
						{/* Season & Intensity */}
						<div className='grid grid-cols-2 gap-4'>
							<div>
								<label className='block text-xs text-zetta-text-secondary mb-1.5 font-medium'>
									Seasonal Theme
								</label>
								<select
									value={season}
									onChange={e =>
										setSeason(e.target.value)
									}
									className='w-full px-3 py-2 bg-zetta-card border border-zetta-border rounded text-sm text-zetta-text focus:outline-none focus:border-zetta-text-secondary focus:ring-1 focus:ring-zetta-text-secondary/20 transition-all'
								>
									<option value='winter'>
										❄️ Winter
									</option>
									<option value='spring'>
										🌸 Spring
									</option>
									<option value='summer'>
										☀️ Summer
									</option>
									<option value='autumn'>
										🍂 Autumn
									</option>
								</select>
							</div>
							<div>
								<label className='block text-xs text-zetta-text-secondary mb-1.5 font-medium'>
									Motion Intensity
								</label>
								<select
									value={intensity}
									onChange={e =>
										setIntensity(e.target.value)
									}
									className='w-full px-3 py-2 bg-zetta-card border border-zetta-border rounded text-sm text-zetta-text focus:outline-none focus:border-zetta-text-secondary focus:ring-1 focus:ring-zetta-text-secondary/20 transition-all'
								>
									<option value='low'>Low</option>
									<option value='medium'>Medium</option>
									<option value='high'>High</option>
								</select>
							</div>
						</div>

						{/* Sound */}
						<div>
							<label className='block text-xs text-zetta-text-secondary mb-1.5 font-medium'>
								Ambient Soundscape
							</label>
							<select
								value={sound}
								onChange={e => setSound(e.target.value)}
								className='w-full px-3 py-2 bg-zetta-card border border-zetta-border rounded text-sm text-zetta-text focus:outline-none focus:border-zetta-text-secondary focus:ring-1 focus:ring-zetta-text-secondary/20 transition-all'
							>
								<option value='fireplace'>
									🔥 Fireplace Crackling
								</option>
								<option value='soft_rain'>
									🌧️ Soft Rain
								</option>
								<option value='light_wind'>
									💨 Light Wind
								</option>
								<option value='rain_window'>
									☔ Rain on Window
								</option>
							</select>
						</div>
					</div>

					{/* Actions */}
					<div className='flex justify-end gap-3 pt-4 border-t border-zetta-border mt-2'>
						<button
							type='button'
							onClick={onClose}
							className='px-4 py-2 text-xs font-medium text-zetta-text-secondary hover:text-zetta-text transition-colors hover:bg-zetta-bg rounded-md'
						>
							Cancel
						</button>
						<button
							type='submit'
							disabled={isSubmitting}
							className={`px-5 py-2 text-xs font-medium text-white rounded-md shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${mode === 'edit'
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
}
