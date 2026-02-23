import { invoke } from '@tauri-apps/api/core';
import { useEffect, useState } from 'react';

export const useSettingPanel = (onLicenseChange?: () => void) => {
	const [licenseKey, setLicenseKey] = useState('');
	const [licenseMessage, setLicenseMessage] = useState('');
	const [currentLicense, setCurrentLicense] =
		useState<string>('Free');
	const [trialDaysRemaining, setTrialDaysRemaining] = useState<
		number | null
	>(null);

	useEffect(() => {
		fetchLicenseState();
	}, []);

	const fetchLicenseState = async () => {
		try {
			const state = await invoke<{ license_type: string }>(
				'get_license'
			);
			setCurrentLicense(state.license_type || 'Free');

			// Fetch trial status if in trial
			if (state.license_type === 'Trial') {
				const trialStatus = await invoke<{
					state: string;
					days_remaining: number;
				}>('get_trial_status');
				setTrialDaysRemaining(trialStatus.days_remaining);
			} else {
				setTrialDaysRemaining(null);
			}
		} catch (error) {
			console.error('Failed to fetch license:', error);
		}
	};

	const handleActivateLicense = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!licenseKey.trim()) {
			setLicenseMessage('Please enter a license key');
			return;
		}
		try {
			const result = await invoke<string>('activate_key', {
				key: licenseKey
			});
			setLicenseMessage(result);
			setLicenseKey('');
			await fetchLicenseState();
			// Refresh global license state after activation
			if (onLicenseChange) {
				onLicenseChange();
			}
		} catch (error) {
			setLicenseMessage(`Error: ${error}`);
		}
	};

	return {
		currentLicense,
		trialDaysRemaining,
		handleActivateLicense,
		licenseKey,
		setLicenseKey,
		licenseMessage
	};
};
