import { invoke } from '@tauri-apps/api/core';
import { useEffect, useState } from 'react';

const DebugPanel = () => {
	const [currentOverride, setCurrentOverride] =
		useState<string>('none');
	const [message, setMessage] = useState<string>('');
	const [licenseState, setLicenseState] =
		useState<LicenseState | null>(null);

	// Fetch current license state on mount
	useEffect(() => {
		fetchLicenseState();
		fetchCurrentOverride();
	}, []);

	const fetchLicenseState = async () => {
		try {
			const state = await invoke<LicenseState>('get_license');
			setLicenseState(state);
		} catch (error) {
			console.error('Failed to fetch license state:', error);
		}
	};

	const fetchCurrentOverride = async () => {
		try {
			const value = await invoke<string>('get_debug_license_override');
			setCurrentOverride(value);
		} catch (error) {
			console.error('Failed to fetch debug override:', error);
		}
	};

	const handleOverrideChange = async (overrideMode: string) => {
		try {
			if (overrideMode === 'none') {
				const result = await invoke<string>(
					'clear_debug_license_override'
				);
				setMessage(result);
			} else {
				const result = await invoke<string>(
					'set_debug_license_override',
					{
						overrideMode
					}
				);
				setMessage(result);
			}
			await fetchCurrentOverride();
			// Refresh license state after override change
			await fetchLicenseState();
		} catch (error) {
			setMessage(`Error: ${error}`);
		}
	};

	const handleClearLicenseStorage = async () => {
		try {
			const result = await invoke<string>('clear_license_storage');
			setMessage(result);
			await fetchLicenseState();
		} catch (error) {
			setMessage(`Error: ${error}`);
		}
	};

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

	return (
		<div className='fixed bottom-4 right-4 z-50'>
			<details className='group'>
				<summary className='cursor-pointer bg-gray-800 text-gray-300 px-3 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors'>
					🔧 Dev License
				</summary>
				<div className='absolute bottom-full right-0 mb-2 bg-gray-900 border border-gray-700 rounded-lg p-4 min-w-[280px] shadow-xl'>
					{/* Active License Display */}
					<div className='mb-4 p-3 bg-gray-800 rounded-lg'>
						<div className='text-xs text-gray-400 mb-1'>
							Active License
						</div>
						<div className='text-lg font-semibold text-white'>
							{displayLicenseName}
						</div>
						{licenseState?.signature && (
							<div className='text-xs text-gray-500 mt-1 truncate'>
								Key: {licenseState.signature}
							</div>
						)}
					</div>

					<h3 className='text-gray-200 font-semibold mb-3 text-sm'>
						License State Simulator
					</h3>

					<div className='space-y-2 mb-4'>
						{debugOptions.map(option => (
							<label
								key={option.value}
								className='flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white'
							>
								<input
									type='radio'
									name='license_override'
									value={option.value}
									checked={currentOverride === option.value}
									onChange={() => handleOverrideChange(option.value)}
									className='accent-blue-500'
								/>
								<span className='text-sm'>{option.label}</span>
							</label>
						))}
					</div>

					<div className='border-t border-gray-700 pt-3'>
						<button
							onClick={handleClearLicenseStorage}
							className='w-full bg-red-900 hover:bg-red-800 text-red-200 px-3 py-2 rounded text-sm transition-colors'
						>
							Clear License Storage
						</button>
					</div>

					{message && (
						<div className='mt-3 text-xs text-gray-400 bg-gray-800 p-2 rounded'>
							{message}
						</div>
					)}

					<div className='mt-3 text-xs text-gray-500'>
						Debug only - Not included in release
					</div>
				</div>
			</details>
		</div>
	);
};

export default DebugPanel;
