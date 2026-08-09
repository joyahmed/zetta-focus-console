import { useProfilePanel } from '../hooks/use-profile-panel';

export default function ProfilePanel({
	profile,
	profiles,
	onProfileSwitch,
	onCreateProfile,
	onEditProfile,
	errorMessage,
	onErrorDismiss,
	stats
}: ProfilePanelProps) {
	const otherProfiles = profiles.filter(p => p.id !== profile.id);
	const formatMinutes = (seconds: number) =>
		`${Number((seconds / 60).toFixed(2))}m`;

	const {
		getSeasonEmoji,
		getMotionLabel,
		getMotionBar,
	} = useProfilePanel();

	return (

		<div className='panel flex-1 h-full p-3 md:p-4 lg:p-6 overflow-hidden flex flex-col gap-4'>
			<div className='flex items-center justify-between shrink-0'>
				<div className='flex items-center gap-2'>
					<div className='p-1.5 rounded-lg bg-zetta-bg border border-zetta-border'>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zetta-neon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<line x1="4" y1="21" x2="4" y2="14" />
							<line x1="4" y1="10" x2="4" y2="3" />
							<line x1="12" y1="21" x2="12" y2="12" />
							<line x1="12" y1="8" x2="12" y2="3" />
							<line x1="20" y1="21" x2="20" y2="16" />
							<line x1="20" y1="12" x2="20" y2="3" />
							<line x1="1" y1="14" x2="7" y2="14" />
							<line x1="9" y1="8" x2="15" y2="8" />
							<line x1="17" y1="16" x2="23" y2="16" />
						</svg>
					</div>
					<h2
						className='text-sm font-semibold tracking-wide text-zetta-text'
					>
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
							{profile.is_preset ? (
								<span className='inline-flex items-center justify-center h-5 px-2 text-[10px] font-medium bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded'>
									PRESET
								</span>
							) : (
								<span className='inline-flex items-center justify-center h-5 px-2 text-[10px] font-medium bg-green-500/10 border border-green-500/20 text-green-500 rounded'>
									CUSTOM
								</span>
							)}
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
						<div className='flex justify-between text-xs mb-1'>
							<span style={{ color: 'var(--text-secondary)' }}>
								Season
							</span>
							<span
								style={{ color: 'var(--text-primary)' }}
								className='capitalize'
							>
								{profile.season}
							</span>
						</div>
					</div>

					<div>
						<div className='flex justify-between text-xs mb-1'>
							<span style={{ color: 'var(--text-secondary)' }}>
								Motion Intensity
							</span>
							<span style={{ color: 'var(--text-primary)' }}>
								{getMotionLabel(profile.motion_intensity)}
							</span>
						</div>
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
						<div className='flex justify-between text-xs mb-1'>
							<span style={{ color: 'var(--text-secondary)' }}>
								Background
							</span>
							<span
								style={{ color: 'var(--text-primary)' }}
								className='capitalize'
							>
								{profile.background_type}
							</span>
						</div>
					</div>

					<div className='pt-2 border-t border-zetta-border'>
						<div className='grid grid-cols-4 gap-1 md:gap-2 text-xs'>
							<div>
								<div style={{ color: 'var(--text-muted)' }}>Focus</div>
								<div style={{ color: 'var(--text-primary)' }}>
									{formatMinutes(profile.focus_duration)}
								</div>
							</div>
							<div>
								<div style={{ color: 'var(--text-muted)' }}>Short</div>
								<div style={{ color: 'var(--text-primary)' }}>
									{formatMinutes(profile.short_break_duration)}
								</div>
							</div>
							<div>
								<div style={{ color: 'var(--text-muted)' }}>Long</div>
								<div style={{ color: 'var(--text-primary)' }}>
									{formatMinutes(profile.long_break_duration)}
								</div>
							</div>
							<div>
								<div style={{ color: 'var(--text-muted)' }}>Sessions</div>
								<div style={{ color: 'var(--text-primary)' }}>
									{profile.sessions_per_cycle}
								</div>
							</div>
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
						{/* Create Button */}
						{onCreateProfile && (
							<button
								onClick={onCreateProfile}
								className='flex-1 group relative overflow-hidden px-3 py-2.5 rounded-xl border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/50 transition-all duration-300'
							>
								<div className='absolute inset-0 translate-y-full group-hover:translate-y-0 bg-gradient-to-t from-blue-500/10 to-transparent transition-transform duration-300' />
								<div className='relative flex items-center justify-center gap-2 text-blue-400 group-hover:text-blue-300'>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-3.5 w-3.5 transition-transform group-hover:scale-110'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M12 4v16m8-8H4'
										/>
									</svg>
									<span className='font-medium tracking-wide text-xs'>Create</span>
								</div>
							</button>
						)}

						{/* Edit Button */}
						{onEditProfile && !profile.is_preset && (
							<button
								onClick={onEditProfile}
								className='flex-1 group relative overflow-hidden px-3 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/50 transition-all duration-300'
							>
								<div className='absolute inset-0 translate-y-full group-hover:translate-y-0 bg-gradient-to-t from-amber-500/10 to-transparent transition-transform duration-300' />
								<div className='relative flex items-center justify-center gap-2 text-amber-400 group-hover:text-amber-300'>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-3.5 w-3.5 transition-transform group-hover:scale-110'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
										/>
									</svg>
									<span className='font-medium tracking-wide text-xs'>Edit</span>
								</div>
							</button>
						)}
					</div>
				</div>
		</div>
	);
}
