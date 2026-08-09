import { useProfileModal } from '../hooks/use-profile-modal';
import Modal from './Modal';
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
	const {
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
	} = useProfileModal({ isOpen, mode, profile, onClose, onSubmit });

	const title = mode === 'create' ? 'Create Custom Profile' : 'Edit Profile';
	const submitLabel = mode === 'create' ? 'Create Profile' : 'Save Changes';
	const submittingLabel = mode === 'create' ? 'Creating...' : 'Saving...';

	return (
		<Modal
			{...{
				isOpen,
				onClose,
				title,
				size: 'form' as ModalSize,
				panelClassName: 'profile-modal-white'
			}}
		>
			{/* The form scrolls; the shell's header stays put above it. */}
			<form
				onSubmit={handleSubmit}
				className='p-5 space-y-5 overflow-y-auto custom-scrollbar'
			>
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
		</Modal>
	);
};

export default ProfileModal;
