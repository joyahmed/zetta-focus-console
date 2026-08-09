import { useState } from 'react';

export const appStates = () => {
	const [appState, setAppState] = useState<AppState | null>(null);
	const [terminalKey, setTerminalKey] = useState(0);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [helpOpen, setHelpOpen] = useState(false);
	const [terminalOpen, setTerminalOpen] = useState(false);
	const [profileModalOpen, setProfileModalOpen] = useState(false);
	const [profileModalMode, setProfileModalMode] =
		useState<ProfileModalMode>('create');
	const [sessionSummary, setSessionSummary] = useState<string | null>(
		null
	);
	const [profileError, setProfileError] = useState<string | null>(
		null
	);

	return {
		appState,
		setAppState,
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
