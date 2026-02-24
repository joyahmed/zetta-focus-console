import { invoke } from '@tauri-apps/api/core';
import { useState } from 'react';

export const useSettingPanel = (onLicenseChange?: () => void) => {
	const [licenseKey, setLicenseKey] = useState('');
	const [licenseMessage, setLicenseMessage] = useState('');

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
			// Refresh canonical Rust-backed license state after activation.
			if (onLicenseChange) {
				onLicenseChange();
			}
		} catch (error) {
			setLicenseMessage(`Error: ${error}`);
		}
	};

	return {
		handleActivateLicense,
		licenseKey,
		setLicenseKey,
		licenseMessage
	};
};
