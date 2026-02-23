import { Dispatch, SetStateAction } from 'react';

interface CommonStatesProps {
	appState: AppState | null;
	setLicenseState: Dispatch<
		SetStateAction<{
			license_type: string;
		} | null>
	>;
	setTrialDaysRemaining: Dispatch<SetStateAction<number | null>>;
}

export interface AppReactivitiesProps extends CommonStatesProps {
	setTerminalOpen: Dispatch<SetStateAction<boolean>>;
	settingsOpen: boolean;
	setSettingsOpen: Dispatch<SetStateAction<boolean>>;
	setAppState: Dispatch<SetStateAction<AppState | null>>;
	setSessionSummary: Dispatch<SetStateAction<string | null>>;
}

export interface AppUtilsProps extends CommonStatesProps {
	setTerminalKey: Dispatch<SetStateAction<number>>;
	setProfileError: Dispatch<SetStateAction<string | null>>;
	setProfileModalMode: Dispatch<SetStateAction<'create' | 'edit'>>;
	setProfileModalOpen: Dispatch<SetStateAction<boolean>>;
}
