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

const DevLicensePopover = ({ onLicenseChange }: DevLicensePopoverProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [currentOverride, setCurrentOverride] = useState('none');
	const popoverRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);

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
				className='group relative p-1.5 text-purple-400 opacity-50 hover:opacity-100 transition-opacity focus:outline-none'
			>
				<InfoIcon className='h-4 w-4' />
				<div className='absolute top-full right-0 mt-2 px-2 py-1 bg-zetta-panel border border-zetta-border text-zetta-text text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg backdrop-blur-md'>
					Dev Tools
				</div>
			</button>

			{isOpen && (
				<div
					ref={popoverRef}
					className='absolute top-full right-0 mt-2 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl z-50 p-4 shadow-2xl'
				>
					<h3 className='text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3'>
						Dev License Tools
					</h3>
					<div className='space-y-1'>
						{DEBUG_OPTIONS.map(option => (
							<button
								key={option.value}
								onClick={() => handleOverrideChange(option.value)}
								className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all font-medium ${currentOverride === option.value
									? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30'
									: 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
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
