import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { InfoIcon } from './icons';

interface DevLicensePopoverProps {
	onLicenseChange?: () => void;
}

const DEBUG_OPTIONS = [
	{ label: 'None (Default)', value: 'none' },
	{ label: 'Free Tier', value: 'free' },
	{ label: 'Pro Tier', value: 'pro' },
	{ label: 'Trial (Active)', value: 'trial_active' },
	{ label: 'Trial (Expired)', value: 'trial_expired' }
];

const DevLicensePopover = ({ onLicenseChange }: DevLicensePopoverProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [currentOverride, setCurrentOverride] = useState('none');

	const handleOverrideChange = async (value: string) => {
		setCurrentOverride(value);
		try {
			await invoke('set_debug_license_override', {
				overrideMode: value
			});
			onLicenseChange?.();
		} catch (error) {
			console.error('Failed to set license override:', error);
		}
	};

	return (
		<div className='relative'>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='group relative p-1.5 text-purple-400 opacity-50 hover:opacity-100 transition-opacity'
			>
				<InfoIcon className='h-4 w-4' />
				<div className='absolute top-full right-0 mt-2 px-2 py-1 bg-zetta-panel border border-zetta-border text-zetta-text text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg backdrop-blur-md'>
					Dev Tools
				</div>
			</button>

			{isOpen && (
				<>
					<div
						className='fixed inset-0 z-50'
						onClick={() => setIsOpen(false)}
					/>
					<div className='absolute top-full right-0 mt-4 w-72 glass-panel rounded-xl z-50 p-4'>
						<h3 className='text-xs font-bold uppercase tracking-wider text-zetta-text-muted mb-3'>
							Dev License Tools
						</h3>
						<div className='space-y-1'>
							{DEBUG_OPTIONS.map((option) => (
								<button
									key={option.value}
									onClick={() => handleOverrideChange(option.value)}
									className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
										currentOverride === option.value
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
	);
};

export default DevLicensePopover;
