import { invoke } from '@tauri-apps/api/core';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseSoundControlProps {
	isPlaying: boolean;
	volume: number;
}

export const useSoundControl = ({
	isPlaying,
	volume
}: UseSoundControlProps) => {
	const [localVolume, setLocalVolume] = useState(volume);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(
		null
	);

	useEffect(() => {
		setLocalVolume(volume);
	}, [volume]);

	const handleVolumeChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newVolume = parseInt(e.target.value, 10);
			setLocalVolume(newVolume);

			// Debounce the backend call
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}

			debounceRef.current = setTimeout(async () => {
				try {
					await invoke('execute_command', {
						command: `sound volume ${newVolume}`
					});
				} catch (error) {
					console.error('Failed to set volume:', error);
				}
			}, 50);
		},
		[]
	);

	const handleMuteToggle = useCallback(async () => {
		try {
			await invoke('execute_command', { command: 'sound mute' });
		} catch (error) {
			console.error('Failed to toggle mute:', error);
		}
	}, []);

	const handlePlayStop = useCallback(async () => {
		try {
			if (isPlaying) {
				await invoke('execute_command', { command: 'sound stop' });
			} else {
				await invoke('execute_command', { command: 'sound play' });
			}
		} catch (error) {
			console.error('Failed to play/stop sound:', error);
		}
	}, [isPlaying]);

	return {
		localVolume,
		handleVolumeChange,
		handleMuteToggle,
		handlePlayStop
	};
};
