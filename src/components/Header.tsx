import { invoke } from '@tauri-apps/api/core';
import { useEffect, useState } from 'react';
import Logo from '../assets/icon.png';

interface LicenseState {
	license_type: string;
	issued_at: string | null;
	expires_at: string | null;
	signature: string | null;
}

interface HeaderProps {
	activeProfileName: string;
	devMode: boolean;
	onSettingsClick: () => void;
	onTerminalClick: () => void;
	volume: number;
	isMuted: boolean;
	onVolumeChange: (volume: number) => void;
	onMuteToggle: () => void;
	theme: string;
	onThemeChange: (theme: string) => void;
	licenseState?: { license_type: string } | null;
	trialDaysRemaining?: number | null;
	onLicenseChange?: () => void;
}

export function Header({
	activeProfileName,
	devMode,
	onSettingsClick,
	onTerminalClick,
	volume,
	isMuted,
	onVolumeChange,
	onMuteToggle,
	theme,
	onThemeChange,
	licenseState: propLicenseState,
	trialDaysRemaining: _trialDaysRemaining,
	onLicenseChange
}: HeaderProps) {
	const isLight = theme === 'light';
	const [devLicenseOpen, setDevLicenseOpen] = useState(false);
	const [currentOverride, setCurrentOverride] =
		useState<string>('none');
	const [message, setMessage] = useState<string>('');
	const [internalLicenseState, setInternalLicenseState] =
		useState<LicenseState | null>(null);

	// Use prop if provided, otherwise use internal state
	const licenseState = propLicenseState || internalLicenseState;
	// _trialDaysRemaining is available from props but not currently used in Header
	// It's used in ProfilePanel instead

	const toggleTheme = () => {
		const themes = ['dark', 'light', 'system'];
		const currentIndex = themes.indexOf(theme);
		const nextIndex = (currentIndex + 1) % themes.length;
		onThemeChange(themes[nextIndex]);
	};

	// Check if running in dev build
	const isDevBuild = import.meta.env.DEV;

	// Fetch current license state on mount (only if no prop provided)
	useEffect(() => {
		if (!propLicenseState) {
			fetchLicenseState();
		}
	}, []);

	const fetchLicenseState = async () => {
		try {
			const state = await invoke<LicenseState>('get_license');
			setInternalLicenseState(state);
		} catch (error) {
			console.error('Failed to fetch license state:', error);
		}
	};

	const handleOverrideChange = async (overrideMode: string) => {
		try {
			if (overrideMode === 'none') {
				const result = await invoke<string>(
					'clear_debug_license_override'
				);
				setMessage(result);
				setCurrentOverride('none');
			} else {
				const result = await invoke<string>(
					'set_debug_license_override',
					{
						overrideMode
					}
				);
				setMessage(result);
				setCurrentOverride(overrideMode);
			}
			// Refresh license state after override change
			await fetchLicenseState();
			// Notify parent to refresh its license state
			if (onLicenseChange) {
				onLicenseChange();
			}
		} catch (error) {
			setMessage(`Error: ${error}`);
		}
	};

	const handleClearLicenseStorage = async () => {
		try {
			const result = await invoke<string>('clear_license_storage');
			setMessage(result);
			await fetchLicenseState();
			// Notify parent to refresh its license state
			if (onLicenseChange) {
				onLicenseChange();
			}
		} catch (error) {
			setMessage(`Error: ${error}`);
		}
	};

	// Close popover when clicking outside
	const closeDevLicense = () => setDevLicenseOpen(false);

	const debugOptions = [
		{ value: 'none', label: 'None (Use Real License)' },
		{ value: 'force_free', label: 'Force Free' },
		{ value: 'force_trial', label: 'Force Trial' },
		{ value: 'force_pro', label: 'Force Pro' },
		{ value: 'force_founder', label: 'Force Founder' },
		{
			value: 'simulate_expired_trial',
			label: 'Simulate Expired Trial'
		}
	];

	// Calculate effective license type (considering override)
	const effectiveLicenseType =
		currentOverride !== 'none'
			? currentOverride
					.replace('force_', '')
					.replace('simulate_expired_trial', 'Trial')
			: licenseState?.license_type || 'Free';

	// Format display name
	const displayLicenseName =
		effectiveLicenseType.charAt(0).toUpperCase() +
		effectiveLicenseType.slice(1);

	// License badge logic - calm engineer tool tone
	// const days = trialDaysRemaining ?? null;
	// const isExpiring = days !== null && days <= 3;
	// const isWarning = days !== null && days > 3 && days <= 7;

	// const getLicenseBadge = () => {
	// 	const type = licenseState?.license_type || 'Free';

	// 	// Trial: calm amber/orange when ≤3 days (not red, not flashing)
	// 	if (type === 'Trial' && days !== null) {
	// 		if (isExpiring) {
	// 			return {
	// 				label: `${days}d left`,
	// 				bg: 'rgba(245, 158, 11, 0.15)',
	// 				text: '#f59e0b',
	// 				border: 'rgba(245, 158, 11, 0.3)'
	// 			};
	// 		}
	// 		if (isWarning) {
	// 			return {
	// 				label: `${days}d left`,
	// 				bg: 'rgba(234, 179, 8, 0.15)',
	// 				text: '#ca8a04',
	// 				border: 'rgba(234, 179, 8, 0.3)'
	// 			};
	// 		}
	// 		return {
	// 			label: `${days}d`,
	// 			bg: 'rgba(34, 197, 94, 0.15)',
	// 			text: '#22c55e',
	// 			border: 'rgba(34, 197, 94, 0.3)'
	// 		};
	// 	}

	// 	const badges: Record<
	// 		string,
	// 		{ label: string; bg: string; text: string; border: string }
	// 	> = {
	// 		Pro: {
	// 			label: 'Pro',
	// 			bg: 'rgba(59, 130, 246, 0.15)',
	// 			text: '#3b82f6',
	// 			border: 'rgba(59, 130, 246, 0.3)'
	// 		},
	// 		Founder: {
	// 			label: 'Founder',
	// 			bg: 'rgba(168, 85, 247, 0.15)',
	// 			text: '#a855f7',
	// 			border: 'rgba(168, 85, 247, 0.3)'
	// 		},
	// 		Free: {
	// 			label: 'Free',
	// 			bg: 'rgba(107, 114, 128, 0.1)',
	// 			text: '#6b7280',
	// 			border: 'rgba(107, 114, 128, 0.2)'
	// 		}
	// 	};

	// 	return badges[type] || badges.Free;
	// };

	// const badge = getLicenseBadge();

	return (
		<header className='flex items-center justify-between pt-4 w-full px-4 mx-auto'>
			<div
				className='flex items-center justify-between w-full mx-auto rounded-md p-2 shadow'
				style={{
					backgroundColor: 'var(--bg-card)',
					borderColor: 'var(--border-color)'
				}}
			>
				<div className='flex items-center gap-3'>
					<img
						src={Logo}
						alt='Zetta Focus Logo'
						className='h-10 w-auto'
					/>
					{devMode && (
						<span
							className='px-1.5 py-0.5 text-[10px] font-medium bg-yellow-500/20 border border-yellow-500/30 rounded'
							style={{ color: '#ca8a04' }}
						>
							DEV
						</span>
					)}
				</div>

				<div className='flex items-center gap-4'>
					{/* Theme Toggle */}
					<button
						onClick={toggleTheme}
						className='p-1.5 transition-colors'
						style={{ color: 'var(--text-secondary)' }}
						title={`Current theme: ${theme} (click to change)`}
					>
						{theme === 'light' ? (
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-5 w-5'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={1.5}
									d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
								/>
							</svg>
						) : theme === 'system' ? (
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
									strokeWidth={1.5}
									d='M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
								/>
							</svg>
						) : (
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
									strokeWidth={1.5}
									d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
								/>
							</svg>
						)}
					</button>

					{/* Command Trigger Input - Opens Terminal Modal */}
					<button
						onClick={onTerminalClick}
						className='flex items-center gap-2 px-3 py-1.5 rounded-md border transition-colors min-w-[180px]'
						style={{
							backgroundColor: 'var(--bg-primary)',
							borderColor: 'var(--border-color)',
							color: 'var(--text-secondary)'
						}}
						title='Open Command Terminal (Ctrl+T)'
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							className='h-3.5 w-3.5'
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={1.5}
								d='M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
							/>
						</svg>
						<span
							className='text-xs font-mono'
							style={{ color: 'var(--text-muted)' }}
						>
							Type a command…
						</span>
						<span
							className='ml-auto text-[10px] px-1.5 py-0.5 rounded'
							style={{
								backgroundColor: 'var(--bg-card)',
								color: 'var(--text-muted)'
							}}
						>
							Ctrl+T
						</span>
					</button>

					{/* Profile Name with License Badge */}
					<div className='flex items-center gap-2'>
						<span
							className='text-xs'
							style={{ color: 'var(--text-secondary)' }}
						>
							<span style={{ color: 'var(--text-primary)' }}>
								{activeProfileName}
							</span>
						</span>
						{/* License Badge */}
						{/* <span
							className='px-2 py-0.5 text-[10px] font-medium rounded border'
							style={{
								backgroundColor: badge.bg,
								color: badge.text,
								borderColor: badge.border,
							}}
						>
							{badge.label}
						</span> */}
					</div>

					{/* Volume Control - Micro */}
					<div className='flex items-center gap-2'>
						<button
							onClick={onMuteToggle}
							className='p-1 transition-colors'
							style={{ color: 'var(--text-secondary)' }}
							title={isMuted ? 'Unmute' : 'Mute'}
						>
							{isMuted ? (
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
										strokeWidth={1.5}
										d='M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z'
									/>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={1.5}
										d='M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2'
									/>
								</svg>
							) : (
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
										strokeWidth={1.5}
										d='M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z'
									/>
								</svg>
							)}
						</button>
						{/* Custom Volume Slider */}
						<div className='flex items-center gap-2'>
							<svg
								width='48'
								height='16'
								viewBox='0 0 48 16'
								className='cursor-pointer'
								onClick={e => {
									const rect =
										e.currentTarget.getBoundingClientRect();
									const x = e.clientX - rect.left;
									const newVolume = Math.round(
										(x / rect.width) * 100
									);
									onVolumeChange(
										Math.max(0, Math.min(100, newVolume))
									);
								}}
							>
								{/* Track */}
								<rect
									x='0'
									y='6'
									width='48'
									height='4'
									rx='2'
									fill={isLight ? '#d1d5db' : '#374151'}
								/>
								{/* Progress */}
								<rect
									x='0'
									y='6'
									width={((isMuted ? 0 : volume) / 100) * 48}
									height='4'
									rx='2'
									fill='var(--color-accent)'
								/>
								{/* Thumb */}
								<circle
									cx={((isMuted ? 0 : volume) / 100) * 48}
									cy='8'
									r='6'
									fill={isLight ? '#1d4ed8' : '#f97316'}
									stroke='var(--bg-card)'
									strokeWidth='2'
								/>
							</svg>
						</div>
					</div>

					{/* Dev License Popover - Right side near settings */}
					{isDevBuild && (
						<div className='relative'>
							{/* License Icon Button */}
							<button
								onClick={() => setDevLicenseOpen(!devLicenseOpen)}
								className='flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-purple-500/20 border border-purple-500/30 rounded hover:bg-purple-500/30 transition-colors'
								style={{ color: '#a855f7' }}
								title='Dev License'
							>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-3 w-3'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z'
									/>
								</svg>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className={`h-3 w-3 transition-transform ${devLicenseOpen ? 'rotate-180' : ''}`}
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M19 9l-7 7-7-7'
									/>
								</svg>
							</button>

							{/* Popover - shows when clicked, closes when clicking outside */}
							{devLicenseOpen && (
								<>
									{/* Backdrop to close on click outside */}
									<div
										className='fixed inset-0 z-40'
										onClick={closeDevLicense}
									/>
									<div
										className='absolute top-full right-0 mt-2 w-72 rounded-lg shadow-xl z-50 overflow-hidden border'
										style={{
											backgroundColor: 'var(--bg-card)',
											borderColor: 'var(--border-color)'
										}}
									>
										{/* Active License Display */}
										<div
											className='p-3 border-b'
											style={{ borderColor: 'var(--border-color)' }}
										>
											<div
												className='text-xs mb-1'
												style={{ color: 'var(--text-muted)' }}
											>
												Active License
											</div>
											<div
												className='text-base font-semibold'
												style={{ color: 'var(--text-primary)' }}
											>
												{displayLicenseName}
											</div>
											{(licenseState as LicenseState | null)
												?.signature && (
												<div
													className='text-xs mt-1 truncate'
													style={{ color: 'var(--text-muted)' }}
												>
													Key:{' '}
													{
														(licenseState as LicenseState | null)
															?.signature
													}
												</div>
											)}
										</div>

										<div className='p-3'>
											<h3
												className='font-semibold mb-2 text-sm'
												style={{ color: 'var(--text-primary)' }}
											>
												License State Simulator
											</h3>

											<div className='space-y-1.5 mb-3'>
												{debugOptions.map(option => (
													<label
														key={option.value}
														className='flex items-center gap-2 cursor-pointer rounded px-2 py-1.5 transition-colors'
														style={{ color: 'var(--text-secondary)' }}
													>
														<input
															type='radio'
															name='license_override'
															value={option.value}
															checked={
																currentOverride === option.value
															}
															onChange={() =>
																handleOverrideChange(option.value)
															}
															className='accent-purple-500'
														/>
														<span className='text-xs'>
															{option.label}
														</span>
													</label>
												))}
											</div>

											<div
												className='border-t pt-3'
												style={{ borderColor: 'var(--border-color)' }}
											>
												<button
													onClick={handleClearLicenseStorage}
													className='w-full px-3 py-1.5 rounded text-xs transition-colors border'
													style={{
														backgroundColor: 'rgba(239, 68, 68, 0.1)',
														color: '#ef4444',
														borderColor: 'rgba(239, 68, 68, 0.3)'
													}}
												>
													Clear License Storage
												</button>
											</div>

											{message && (
												<div
													className='mt-3 text-xs p-2 rounded'
													style={{
														color: 'var(--text-muted)',
														backgroundColor: 'var(--bg-secondary)'
													}}
												>
													{message}
												</div>
											)}

											<div
												className='mt-3 text-[10px]'
												style={{ color: 'var(--text-muted)' }}
											>
												Debug only - Not included in release
											</div>
										</div>
									</div>
								</>
							)}
						</div>
					)}

					{/* Settings Button */}
					<button
						onClick={onSettingsClick}
						className='p-1.5 transition-colors'
						style={{ color: 'var(--text-secondary)' }}
						title='Settings'
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
								strokeWidth={1.5}
								d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
							/>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={1.5}
								d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
							/>
						</svg>
					</button>
				</div>
			</div>
		</header>
	);
}

