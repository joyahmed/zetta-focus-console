import { useState } from 'react';

export const appStates = () => {
	const [appState, setAppState] = useState<AppState | null>(null);
	const [licenseState, setLicenseState] = useState<{
		license_type: string;
	} | null>(null);
	const [trialDaysRemaining, setTrialDaysRemaining] = useState<
		number | null
	>(null);
	const [terminalKey, setTerminalKey] = useState(0);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [helpOpen, setHelpOpen] = useState(false);
	const [terminalOpen, setTerminalOpen] = useState(false);
	const [profileModalOpen, setProfileModalOpen] = useState(false);
	const [profileModalMode, setProfileModalMode] = useState<
		'create' | 'edit'
	>('create');
	const [sessionSummary, setSessionSummary] = useState<string | null>(
		null
	);
	const [profileError, setProfileError] = useState<string | null>(
		null
	);

	return {
		appState,
		setAppState,
		licenseState,
		setLicenseState,
		trialDaysRemaining,
		setTrialDaysRemaining,
		terminalKey,
		setTerminalKey,
		settingsOpen,
		setSettingsOpen,
		helpOpen,
		setHelpOpen,
		terminalOpen,
		setTerminalOpen,
		profileModalOpen,
		setProfileModalOpen,
		profileModalMode,
		setProfileModalMode,
		sessionSummary,
		setSessionSummary,
		profileError,
		setProfileError
	};
};
