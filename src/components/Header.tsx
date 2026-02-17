import { invoke } from '@tauri-apps/api/core';
import { useState } from 'react';
import Logo from '../assets/icon.png';

const Header = ({
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
}: HeaderProps) => {
	const isLight = theme === 'light';
	const [devLicenseOpen, setDevLicenseOpen] = useState(false);
	const [currentOverride, setCurrentOverride] =
		useState<string>('none');

	const toggleTheme = () => {
		const themes = ['dark', 'light', 'system'];
		const currentIndex = themes.indexOf(theme);
		const nextIndex = (currentIndex + 1) % themes.length;
		onThemeChange(themes[nextIndex]);
	};

	// Check if running in dev build
	const isDevBuild = import.meta.env.DEV;

	const debugOptions = [
		{ label: 'None (Default)', value: 'none' },
		{ label: 'Free Tier', value: 'free' },
		{ label: 'Pro Tier', value: 'pro' },
		{ label: 'Trial (Active)', value: 'trial_active' },
		{ label: 'Trial (Expired)', value: 'trial_expired' }
	];

	const closeDevLicense = () => setDevLicenseOpen(false);

	const handleOverrideChange = async (value: string) => {
		setCurrentOverride(value);
		try {
			await invoke('set_debug_license_override', {
				overrideMode: value
			});
			if (onLicenseChange) {
				onLicenseChange();
			}
		} catch (error) {
			console.error('Failed to set license override:', error);
		}
	};

	return (
		<header className='w-full px-4 pt-6 pb-2 z-40 flex justify-center'>
			<div className={`glass-panel flex items-center justify-between w-full rounded-2xl px-4 py-2.5 transition-all duration-300 ${isLight ? 'shadow-sm border-black/5 hover:shadow-md' : 'shadow-glass hover:shadow-neon/20 hover:border-white/10'}`}>
				{/* Logo / Brand */}
				<div className='flex items-center gap-4 w-1/4'>
					<div className='relative group cursor-default'>
						<img
							src={Logo}
							alt='Zetta'
							className='h-8 w-auto opacity-90 group-hover:opacity-100 transition-opacity'
						/>
						{/* Ambient Glow behind logo */}
						<div className='absolute inset-0 bg-purple-500/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
					</div>

					{devMode && (
						<span className='px-1.5 py-0.5 text-[9px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded tracking-wider'>
							DEV
						</span>
					)}
				</div>

				{/* Center: Command Spotlight */}
				<button
					onClick={onTerminalClick}
					className='group flex-1 max-w-md mx-4 relative'
				>
					<div className='relative flex items-center justify-between px-4 py-1.5 rounded-lg bg-[var(--bg-command)] hover:bg-[var(--bg-command-hover)] transition-all backdrop-blur-xl focus-within:shadow-[inset_0_0_20px_rgba(139,92,246,0.1)]'>
						<div className='flex items-center gap-3'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-4 w-4 text-zetta-text-muted group-hover:text-zetta-text-secondary transition-colors'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
								/>
							</svg>
							<span className='text-sm text-zetta-text-muted group-hover:text-zetta-text-secondary transition-colors font-medium'>
								Type a command...
							</span>
						</div>
						<div className='flex items-center gap-1.5'>
							<kbd className='hidden md:inline-flex items-center h-5 px-1.5 text-[10px] font-mono text-zetta-text-muted bg-zetta-border border border-zetta-border rounded backdrop-blur-sm'>
								Ctrl
							</kbd>
							<kbd className='hidden md:inline-flex items-center h-5 px-1.5 text-[10px] font-mono text-zetta-text-muted bg-zetta-border border border-zetta-border rounded backdrop-blur-sm'>
								T
							</kbd>
						</div>
					</div>
				</button>

				{/* Right: Actions & Status */}
				<div className='flex items-center justify-end gap-3 w-1/4'>
					{/* Profile Pill */}
					<div className='hidden md:flex items-center px-3 py-1.5 rounded-full bg-zetta-bg/50 border border-zetta-border hover:bg-zetta-bg transition-colors'>
						<span className='w-1.5 h-1.5 rounded-full bg-zetta-neon mr-2 animate-pulse' />
						<span className='text-xs font-medium text-zetta-text-secondary truncate max-w-[100px]'>
							{activeProfileName}
						</span>
					</div>

					<div className='h-4 w-[1px] bg-zetta-border mx-1' />

					{/* Volume Control */}
					<div className='group/volume relative flex items-center bg-zetta-bg/50 rounded-lg hover:bg-zetta-bg transition-all duration-300 border border-transparent hover:border-zetta-border'>
						<button
							onClick={onMuteToggle}
							className='p-2 text-zetta-text-muted hover:text-zetta-text transition-colors relative z-10'
						>
							{isMuted || volume === 0 ? (
								<svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z' />
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2' />
								</svg>
							) : (
								<svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z' />
								</svg>
							)}
						</button>

						<div className='w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300 ease-out flex items-center pr-0 group-hover/volume:pr-2'>
							<input
								type='range'
								min='0'
								max='100'
								value={isMuted ? 0 : volume}
								onChange={(e) => onVolumeChange(parseInt(e.target.value))}
								className='w-full h-1 bg-zetta-border rounded-full appearance-none cursor-pointer
									[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zetta-text [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(var(--color-text-primary-rgb),0.5)] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110'
							/>
						</div>
					</div>

					{/* Theme Toggle */}
					<button
						onClick={toggleTheme}
						className='group relative p-2 rounded-lg text-zetta-text-muted hover:text-zetta-text hover:bg-zetta-bg transition-all'
					>
						{theme === 'light' && (
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
									d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
								/>
							</svg>
						)}
						{theme === 'dark' && (
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
									d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
								/>
							</svg>
						)}
						{theme === 'system' && (
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
									d='M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
								/>
							</svg>
						)}
						<div className='absolute top-full right-0 mt-2 px-2 py-1 bg-zetta-panel border border-zetta-border text-zetta-text text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg backdrop-blur-md'>
							Switch Theme
						</div>
					</button>

					{/* Settings */}
					<button
						onClick={onSettingsClick}
						className='group relative p-2 rounded-lg text-zetta-text-muted hover:text-zetta-text hover:bg-zetta-bg transition-all'
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
								d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
							/>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
							/>
						</svg>
						<div className='absolute top-full right-0 mt-2 px-2 py-1 bg-zetta-panel border border-zetta-border text-zetta-text text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg backdrop-blur-md'>
							Settings
						</div>
					</button>

					{/* Dev License Trigger */}
					{isDevBuild && (
						<div className='relative'>
							<button
								onClick={() => setDevLicenseOpen(!devLicenseOpen)}
								className='group relative p-1.5 text-purple-400 opacity-50 hover:opacity-100 transition-opacity'
							>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-4 w-4'
									viewBox='0 0 20 20'
									fill='currentColor'
								>
									<path
										fillRule='evenodd'
										d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
										clipRule='evenodd'
									/>
								</svg>
								<div className='absolute top-full right-0 mt-2 px-2 py-1 bg-zetta-panel border border-zetta-border text-zetta-text text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg backdrop-blur-md'>
									Dev Tools
								</div>
							</button>

							{/* Dev License Popover (Simplifed) */}
							{devLicenseOpen && (
								<>
									<div
										className='fixed inset-0 z-40'
										onClick={closeDevLicense}
									/>
									<div className='absolute top-full right-0 mt-4 w-72 glass-panel rounded-xl z-50 p-4'>
										<h3 className='text-xs font-bold uppercase tracking-wider text-zetta-text-muted mb-3'>
											Dev License Tools
										</h3>
										<div className='space-y-1'>
											{debugOptions.map(option => (
												<button
													key={option.value}
													onClick={() =>
														handleOverrideChange(option.value)
													}
													className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${currentOverride === option.value
														? 'bg-zetta-neon/20 text-zetta-neon border border-zetta-neon/30'
														: 'text-zetta-text-secondary hover:bg-white/5'
														}`}
												>
													{option.label}
												</button>
											))}
										</div>
									</div>
								</>
							)}
						</div>
					)}
				</div>
			</div>
		</header>
	);
};

export default Header;
