import { invoke } from '@tauri-apps/api/core';
import { useEffect, useState } from 'react';
import Toggle from './Toggle';

interface StartupSectionProps {
	isLight: boolean;
}

const StartupSection = ({ isLight }: StartupSectionProps) => {
	const [autostartEnabled, setAutostartEnabled] = useState(false);
	const [startMinimized, setStartMinimized] = useState(false);
	const [loading, setLoading] = useState(true);

	// Load current startup settings on mount
	useEffect(() => {
		const loadStartupSettings = async () => {
			try {
				const autostart = await invoke<boolean>(
					'get_autostart_enabled'
				);
				setAutostartEnabled(autostart);

				const minimized = await invoke<boolean>(
					'get_start_minimized'
				);
				setStartMinimized(minimized);
			} catch (error) {
				console.error('Failed to load startup settings:', error);
			} finally {
				setLoading(false);
			}
		};

		loadStartupSettings();
	}, []);

	const handleAutostartToggle = async () => {
		try {
			const newValue = !autostartEnabled;
			await invoke('set_autostart_enabled', { enabled: newValue });
			setAutostartEnabled(newValue);
		} catch (error) {
			console.error('Failed to toggle autostart:', error);
		}
	};

	const handleStartMinimizedToggle = async () => {
		try {
			const newValue = !startMinimized;
			// Store preference via backend
			await invoke('set_start_minimized', { enabled: newValue });
			setStartMinimized(newValue);
		} catch (error) {
			console.error('Failed to toggle start minimized:', error);
		}
	};

	if (loading) {
		return (
			<section>
				<h3
					className='text-sm font-medium uppercase tracking-wider mb-3'
					style={{ color: 'var(--text-secondary)' }}
				>
					Startup
				</h3>
				<div className='animate-pulse space-y-3'>
					<div className='h-12 bg-gray-700 rounded-lg'></div>
					<div className='h-12 bg-gray-700 rounded-lg'></div>
				</div>
			</section>
		);
	}

	return (
		<section>
			<h3
				className='text-sm font-medium uppercase tracking-wider mb-3'
				style={{ color: 'var(--text-secondary)' }}
			>
				Startup
			</h3>

			<div
				className='space-y-3 p-2 rounded-lg'
				style={{
					backgroundColor: 'var(--bg-primary)',
					borderColor: 'var(--border-color)'
				}}
			>
				{/* Start with Windows */}
				<div
					className='flex items-center justify-between p-3 rounded-lg border glass-panel bg-black/5 backdrop-blur-xl'
					style={{
						borderColor: 'var(--border-color)'
					}}
				>
					<div>
						<div
							className='text-sm font-medium'
							style={{ color: 'var(--text-primary)' }}
						>
							Start with Windows
						</div>
						<div
							className='text-xs'
							style={{ color: 'var(--text-muted)' }}
						>
							Launch app when Windows starts
						</div>
					</div>
					<Toggle
						enabled={autostartEnabled}
						onChange={handleAutostartToggle}
						isLight={isLight}
					/>
				</div>

				{/* Start Minimized */}
				<div
					className='flex items-center justify-between p-3 rounded-lg border glass-panel bg-black/5 backdrop-blur-xl'
					style={{
						borderColor: 'var(--border-color)'
					}}
				>
					<div>
						<div
							className='text-sm font-medium'
							style={{ color: 'var(--text-primary)' }}
						>
							Start Minimized
						</div>
						<div
							className='text-xs'
							style={{ color: 'var(--text-muted)' }}
						>
							Start app minimized to system tray
						</div>
					</div>
					<Toggle
						enabled={startMinimized}
						onChange={handleStartMinimizedToggle}
						isLight={isLight}
					/>
				</div>
			</div>
		</section>
	);
};

export default StartupSection;
