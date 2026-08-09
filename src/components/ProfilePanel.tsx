import { formatMinutes } from '../utils/format';
import {
	getMotionBar,
	getMotionLabel,
	getSeasonEmoji
} from '../utils/profile';
import DetailRow from './profile-panel/DetailRow';
import {
	CopyIcon,
	PencilIcon,
	PlusIcon,
	SlidersIcon
} from './profile-panel/icons';

/** Create and Edit were the same fourteen lines twice over — a bordered button
    with a gradient that rises on hover — differing in colour, icon, label and
    handler. Everything that differs is here; the button itself is written once
    below. Tailwind's class names are spelled out in full because the JIT scan
    cannot see a colour assembled at runtime. */
const PROFILE_ACTIONS: ProfileAction[] = [
	{
		key: 'create',
		label: 'Create',
		Icon: PlusIcon,
		frame: 'border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/50',
		wash: 'from-blue-500/10',
		text: 'text-blue-400 group-hover:text-blue-300'
	},
	{
		key: 'edit',
		label: 'Edit',
		Icon: PencilIcon,
		frame: 'border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/50',
		wash: 'from-amber-500/10',
		text: 'text-amber-400 group-hover:text-amber-300'
	},
	{
		key: 'duplicate',
		label: 'Duplicate',
		Icon: CopyIcon,
		frame: 'border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/50',
		wash: 'from-amber-500/10',
		text: 'text-amber-400 group-hover:text-amber-300'
	}
];

const ProfilePanel = ({
	profile,
	profiles,
	onProfileSwitch,
	onCreateProfile,
	onEditProfile,
	onDuplicateProfile,
	errorMessage,
	onErrorDismiss,
	stats
}: ProfilePanelProps) => {
	const otherProfiles = profiles.filter(p => p.id !== profile.id);

	const durations = [
		{ label: 'Focus', value: formatMinutes(profile.focus_duration) },
		{ label: 'Short', value: formatMinutes(profile.short_break_duration) },
		{ label: 'Long', value: formatMinutes(profile.long_break_duration) },
		{ label: 'Sessions', value: String(profile.sessions_per_cycle) }
	];

	/** Only the actions this profile can actually take. A preset is read-only
	    in the engine, so it offers Duplicate — the same form, seeded, saving
	    to a new custom profile — where a custom one offers Edit. */
	const handlers: Record<ProfileAction['key'], (() => void) | undefined> = {
		create: onCreateProfile,
		edit: profile.is_preset ? undefined : onEditProfile,
		duplicate: profile.is_preset ? onDuplicateProfile : undefined
	};

	const actions = PROFILE_ACTIONS.filter(
		action => handlers[action.key]
	).map(action => ({ ...action, onClick: handlers[action.key]! }));

	return (
		<div className='panel flex-1 h-full p-3 md:p-4 lg:p-6 overflow-hidden flex flex-col gap-4'>
			<div className='flex items-center justify-between shrink-0'>
				<div className='flex items-center gap-2'>
					<div className='p-1.5 rounded-lg bg-zetta-bg border border-zetta-border'>
						<SlidersIcon className='h-4 w-4 text-zetta-neon' />
					</div>
					<h2 className='text-sm font-semibold tracking-wide text-zetta-text'>
						PROFILE
					</h2>
				</div>
			</div>

			<div className='flex items-center gap-2 md:gap-3 shrink-0'>
				<div
					className='w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-base md:text-xl'
					style={{ backgroundColor: `${profile.glow_color}20` }}
				>
					{getSeasonEmoji(profile.season)}
				</div>
				<div className='flex-1'>
					<div className='flex items-center gap-2 flex-wrap'>
						<span
							className='text-sm md:text-lg font-semibold'
							style={{ color: 'var(--text-primary)' }}
						>
							{profile.name}
						</span>
						<span
							className={`inline-flex items-center justify-center h-5 px-2 text-[10px] font-medium rounded ${
								profile.is_preset
									? 'bg-blue-500/10 border border-blue-500/20 text-blue-500'
									: 'bg-green-500/10 border border-green-500/20 text-green-500'
							}`}
						>
							{profile.is_preset ? 'PRESET' : 'CUSTOM'}
						</span>
					</div>

					{/* Sessions Today */}
					<div className='flex items-center gap-2 mt-1'>
						<span
							className='text-[10px] font-medium'
							style={{ color: 'var(--text-muted)' }}
						>
							Sessions Today:
						</span>
						<span
							className='text-[10px] font-semibold'
							style={{ color: profile.glow_color }}
						>
							{stats?.sessions_today ?? 0}
						</span>
						<span
							className='text-[10px] font-medium ml-2'
							style={{ color: 'var(--text-muted)' }}
						>
							Profile Sessions:
						</span>
						<span
							className='text-[10px] font-semibold'
							style={{ color: profile.glow_color }}
						>
							{profile.sessions_per_cycle}
						</span>
					</div>

					<div
						className='text-[10px] md:text-xs mt-1'
						style={{ color: 'var(--text-muted)' }}
					>
						ID: {profile.id}
					</div>
				</div>
			</div>

			<div className='flex-1 min-h-0 overflow-y-auto custom-scrollbar -mr-2 pr-2 pb-2'>
				<div className='space-y-2 md:space-y-4'>
					<div>
						<DetailRow
							{...{
								label: 'Season',
								value: profile.season,
								capitalize: true
							}}
						/>
					</div>

					<div>
						<DetailRow
							{...{
								label: 'Motion Intensity',
								value: getMotionLabel(profile.motion_intensity)
							}}
						/>
						<div className='flex gap-1'>
							{[1, 2, 3].map(level => (
								<div
									key={level}
									className='h-1.5 flex-1 rounded-full transition-colors'
									style={{
										backgroundColor:
											level <= getMotionBar(profile.motion_intensity)
												? profile.glow_color
												: 'var(--border-color)'
									}}
								/>
							))}
						</div>
					</div>

					<div>
						<DetailRow
							{...{
								label: 'Background',
								value: profile.background_type,
								capitalize: true
							}}
						/>
					</div>

					<div className='pt-2 border-t border-zetta-border'>
						<div className='grid grid-cols-4 gap-1 md:gap-2 text-xs'>
							{durations.map(({ label, value }) => (
								<div key={label}>
									<div style={{ color: 'var(--text-muted)' }}>
										{label}
									</div>
									<div style={{ color: 'var(--text-primary)' }}>
										{value}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{otherProfiles.length > 0 && (
					<div className='mt-2 md:mt-4 pt-2 md:pt-4 border-t border-zetta-border'>
						<div
							className='text-xs mb-1 md:mb-2'
							style={{ color: 'var(--text-muted)' }}
						>
							Quick Switch
						</div>
						<div className='flex flex-wrap gap-1'>
							{otherProfiles.map(p => (
								<button
									key={p.id}
									onClick={() => onProfileSwitch(p.id)}
									className='px-1.5 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs bg-zetta-bg border border-zetta-border rounded hover:border-blue-500/50 hover:bg-blue-500/10 transition-colors'
									style={{ color: 'var(--text-secondary)' }}
								>
									{p.name}
								</button>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Actions Area — pinned to the bottom so the panel does not
			    trail off into empty space when the profile list is short. */}
			<div className='shrink-0 pt-2 md:pt-4 border-t border-zetta-border'>
				{/* Error Message - Cyber Minimalist */}
				{errorMessage && (
					<div className='mb-3 relative group overflow-hidden rounded-md bg-red-500/5 border border-red-500/20'>
						<div className='absolute inset-y-0 left-0 w-1 bg-red-500/50' />
						<div className='p-2 pl-3 flex items-center justify-between'>
							<span className='text-[10px] md:text-xs text-red-400 font-medium tracking-wide'>
								{errorMessage}
							</span>
							{onErrorDismiss && (
								<button
									onClick={onErrorDismiss}
									className='text-red-400/50 hover:text-red-400 transition-colors p-1'
								>
									✕
								</button>
							)}
						</div>
					</div>
				)}

				<div className='flex gap-3'>
					{actions.map(({ key, label, Icon, frame, wash, text, onClick }) => (
						<button
							key={key}
							onClick={onClick}
							className={`flex-1 group relative overflow-hidden px-3 py-2.5 rounded-xl border transition-all duration-300 ${frame}`}
						>
							<div
								className={`absolute inset-0 translate-y-full group-hover:translate-y-0 bg-gradient-to-t to-transparent transition-transform duration-300 ${wash}`}
							/>
							<div
								className={`relative flex items-center justify-center gap-2 ${text}`}
							>
								<Icon className='h-3.5 w-3.5 transition-transform group-hover:scale-110' />
								<span className='font-medium tracking-wide text-xs'>
									{label}
								</span>
							</div>
						</button>
					))}
				</div>
			</div>
		</div>
	);
};

export default ProfilePanel;
