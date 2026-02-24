import { invoke } from '@tauri-apps/api/core';
import { useEffect, useRef, useState } from 'react';
import { InfoIcon } from './icons';

interface DevLicensePopoverProps {
	onLicenseChange?: () => void;
}

const DEBUG_OPTIONS = [
	{ label: 'None (Default)', value: 'none' },
	{ label: 'Free Tier', value: 'force_free' },
	{ label: 'Pro Tier', value: 'force_pro' },
	{ label: 'Founder Tier', value: 'force_founder' },
	{ label: 'Trial (Active)', value: 'force_trial' },
	{ label: 'Trial (Expired)', value: 'simulate_expired_trial' }
];

const DevLicensePopover = ({
	onLicenseChange
}: DevLicensePopoverProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [currentOverride, setCurrentOverride] = useState('none');
	const popoverRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);

	const handleOverrideChange = async (value: string) => {
		try {
			await invoke('set_debug_license_override', {
				overrideMode: value
			});
			const fresh = await invoke<string>(
				'get_debug_license_override'
			);
			setCurrentOverride(fresh);
			onLicenseChange?.();
		} catch (error) {
			console.error('Failed to set license override:', error);
		}
	};

	useEffect(() => {
		if (!isOpen) return;

		const fetchCurrentOverride = async () => {
			try {
				const value = await invoke<string>(
					'get_debug_license_override'
				);
				setCurrentOverride(value);
			} catch (error) {
				console.error(
					'Failed to fetch current license override:',
					error
				);
			}
		};

		fetchCurrentOverride();
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				setIsOpen(false);
			}
		};

		const handleClickOutside = (e: MouseEvent) => {
			if (
				popoverRef.current &&
				!popoverRef.current.contains(e.target as Node) &&
				!buttonRef.current?.contains(e.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen]);

	return (
		<div className='relative'>
			<button
				ref={buttonRef}
				onClick={() => setIsOpen(!isOpen)}
				className='group relative p-1.5 text-zetta-text-secondary hover:text-zetta-neon opacity-60 hover:opacity-100 transition-all focus:outline-none'
			>
				<InfoIcon className='h-4 w-4' />
				<div className='absolute top-full right-0 mt-2 px-2 py-1 bg-zetta-panel border border-zetta-border text-zetta-text text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg backdrop-blur-md'>
					Dev Tools
				</div>
			</button>

			{isOpen && (
				<div
					ref={popoverRef}
					className='absolute top-full right-0 mt-2 w-72 bg-zetta-card border border-zetta-border rounded-xl z-50 p-4 shadow-2xl backdrop-blur-xl'
				>
					<h3 className='text-xs font-bold uppercase tracking-wider text-zetta-text-secondary mb-3'>
						Dev License Tools
					</h3>
					<div className='space-y-1'>
						{DEBUG_OPTIONS.map(option => (
							<button
								key={option.value}
								onClick={() => handleOverrideChange(option.value)}
								className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all font-medium ${
									currentOverride === option.value
										? 'bg-zetta-neon/15 text-zetta-neon border border-zetta-neon/30'
										: 'text-zetta-text-secondary hover:bg-zetta-panel hover:text-zetta-text'
								}`}
							>
								{option.label}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default DevLicensePopover;
